require "json"
require "stringio"

module LiveEvaluator
  class TimeoutError < StandardError; end

  # 評価環境を隔離するための無名クラスのバインディングを生成する
  def self.create_sandbox_binding
    sandbox_class = Class.new
    sandbox_class.class_eval(<<~RUBY)
      def get_binding
        binding
      end
    RUBY
    sandbox_class.new.get_binding
  end

  # 実行ステップ数の上限（無限ループ対策）
  STEP_LIMIT = 100_000

  # システム内部で使用される除外対象のグローバル変数
  SYSTEM_GLOBALS = [:$raw_rbs_env, :$rubox_stdin, :$stdout, :$stderr, :$stdin]

  def self.run(code)
    # 初回実行時に、その時点でのグローバル変数を「システム変数」として記録する
    @initial_globals ||= global_variables

    variables = {}
    status = "ok"
    
    # 完全に隔離されたバインディングを生成
    b = create_sandbox_binding
    
    # 実行ステップ数を監視するTracePoint
    count = 0
    tp = TracePoint.new(:line, :call, :b_call) do
      count += 1
      if count > STEP_LIMIT
        raise TimeoutError, "Execution limit exceeded"
      end
    end

    begin
      original_stdout = $stdout
      original_stderr = $stderr
      original_stdin = $stdin
      $stdout = $stderr = StringIO.new
      $stdin = StringIO.new($rubox_stdin || "")

      begin
        tp.enable { b.eval(code) }
      rescue TimeoutError
        status = "timeout"
      rescue Exception
        status = "error"
      ensure
        tp.disable if tp.enabled?
        $stdout = original_stdout
        $stderr = original_stderr
        $stdin = original_stdin
      end

      # 評価が成功したか、タイムアウトした場合に変数を取得する
      # タイピング中の不正な構文（error）による負荷は防ぐ
      if status == "ok" || status == "timeout"
        # ローカル変数を取得
        b.local_variables.each do |var|
          begin
            val = b.local_variable_get(var)
            variables[var.to_s] = val.inspect
          rescue; end
        end

        # インスタンス変数を取得
        b.eval("instance_variables").each do |var|
          begin
            val = b.eval(var.to_s)
            variables[var.to_s] = val.inspect
          rescue; end
        end

        # グローバル変数を取得
        (global_variables - @initial_globals).each do |var|
          next if SYSTEM_GLOBALS.include?(var)
          begin
            val = eval(var.to_s)
            variables[var.to_s] = val.inspect
          rescue; end
        end
      end

    rescue Exception
      status = "error"
    end

    JSON.generate({ variables: variables, status: status })
  end
end
