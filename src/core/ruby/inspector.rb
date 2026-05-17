require "json"
require "stringio"
require "prism"

module Inspector
  class Session
    MAX_HISTORY_SIZE = 10
    UNDEFINED = Object.new # 未取得状態を厳密に表すためのトークン

    # # 非対応ケース (block_variable)
    # 同一行に同名のブロックパラメータを持つ複数のブロックが存在する場合、
    # ブロックの識別に local_variables の変化を利用しているため区別できない。
    # 例: [1].each { |a| a }.map { |a| a }
    # この場合、最初のブロック（order=0）の値として両方のイテレーションが記録される。
    # 異なる行、または異なる変数名であれば問題なく動作する。

    def initialize(expression, target_line, kind, end_line, pre_execution_target, block_depth = nil, block_order = nil, block_start_line = nil)
      @expression = expression
      @target_line = target_line
      @kind = kind
      @end_line = end_line
      @pre_execution_target = pre_execution_target
      @block_depth = block_depth
      @block_order = block_order
      @block_start_line = block_start_line

      @history = []
      @last_value = nil
      @initial_value = UNDEFINED
      @saved_binding = nil
      @current_depth = 0
      @entry_depth = nil
    end

    def execute(code)
      $stdin = StringIO.new($rubox_stdin || "")
      observer = create_observer
      evaluate(code, observer)
      report
    end

    private

    def create_observer
      if @kind == 'block_variable' && !@block_depth.nil? && !@block_order.nil?
        create_block_variable_observer
      else
        create_default_observer
      end
    end

    # block_variable かつ block_depth/block_order が指定されている場合の Observer
    # blockStartLine を使ってブロック遷移を検出し、正しいブロックのみキャプチャする
    # 複数行ブロックでは :line イベントでターゲット行到達時に pre_execution をキャプチャする
    def create_block_variable_observer
      current_depth = 0
      block_idx     = 0
      in_my_block   = false
      prev_locals   = nil
      pre_captured  = false
      # blockStartLine があれば使う（複数行ブロック対応）、なければ target_line にフォールバック
      match_line = @block_start_line || @target_line

      TracePoint.new(:b_call, :b_return, :line) do |tp|
        case tp.event
        when :b_call
          if tp.lineno == match_line && current_depth == @block_depth
            curr_locals = tp.binding.local_variables
            block_idx += 1 if prev_locals && curr_locals != prev_locals
            prev_locals = curr_locals

            if block_idx == @block_order
              in_my_block    = true
              @saved_binding = tp.binding
              pre_captured   = false
              # 1行ブロック（match_line == target_line）の場合は b_call 時点でキャプチャ
              if match_line == @target_line
                record_pre_execution_state(tp)
                pre_captured = true
              end
            end
          end
          current_depth += 1

        when :line
          # 複数行ブロックの場合、ターゲット行に初めて到達した時点でキャプチャ
          if in_my_block && !pre_captured && tp.lineno == @target_line
            @saved_binding = tp.binding
            record_pre_execution_state(tp)
            pre_captured = true
          end

        when :b_return
          current_depth -= 1
          if current_depth == @block_depth && in_my_block
            record_post_execution_result(tp)
            in_my_block  = false
            pre_captured = false
          end
        end
      end
    end

    # 既存のデフォルト Observer（block_variable 以外、または block_depth 未指定の場合）
    def create_default_observer
      TracePoint.new(:line, :call, :b_call, :c_call, :return, :b_return, :c_return) do |tp|
        case tp.event
        when :call, :b_call, :c_call
          @current_depth += 1
        when :return, :b_return, :c_return
          @current_depth -= 1
        end

        if initial_value_captured?
          if capture_ready?(tp)
            record_post_execution_result(tp)
            @entry_depth = nil
          end
        elsif reached_target_line?(tp) && @entry_depth.nil?
          @saved_binding = tp.binding
          @entry_depth = @current_depth
          record_pre_execution_state(tp)
        end
      end
    end

    def evaluate(code, observer)
      original_stdout, original_stderr = $stdout, $stderr
      $stdout, $stderr = StringIO.new, StringIO.new

      begin
        clean_binding = Object.new.instance_eval { binding }
        Environment.prepare(code, clean_binding)
        observer.enable { clean_binding.eval(code) }
      rescue Exception
        # 実行時エラーや SyntaxError などの例外を安全に捕捉してスルーする
      ensure
        $stdout, $stderr = original_stdout, original_stderr
        observer.disable if observer.enabled?
      end
    end

    def report
      {
        history: @history,
        lastValue: @last_value || "(not executed)"
      }
    end

    # --- 判定メソッド ---

    def initial_value_captured?
      @initial_value != UNDEFINED
    end

    def reached_target_line?(tp)
      return false if tp.lineno != @target_line
      @kind == 'block_variable' ? tp.event == :b_call : tp.event == :line
    end

    def capture_ready?(tp)
      # メソッド呼び出しの場合は、そのメソッドの終了時が準備完了
      if target_method_name
        return [:return, :c_return].include?(tp.event) && tp.method_id == target_method_name
      end

      # 共通の終了判定:
      # 1. 行番号が進んだ (tp.lineno > @end_line)
      # 2. 現在のスコープを抜けた (@entry_depth があればチェック)
      # 3. 全体の実行が終了した (eval の c_return)
      finished = (tp.event == :line && tp.lineno > @end_line) ||
                 (@entry_depth && @current_depth < @entry_depth) ||
                 (tp.event == :c_return && tp.method_id == :eval)

      return true if finished

      false
    end

    def target_method_name
      return nil if ['variable', 'block_variable', 'assignment'].include?(@kind)
      return @target_method_name if defined?(@target_method_name)
      @target_method_name = begin
        parsed = Prism.parse(@expression)
        return nil unless parsed.success?
        node = parsed.value.statements.body.first

        if node.is_a?(Prism::CallNode)
          node.name.to_sym
        elsif node.respond_to?(:value) && node.value.is_a?(Prism::CallNode)
          node.value.name.to_sym
        end
      rescue
        nil
      end
    end

    # --- キャプチャ実行メソッド ---

    def record_pre_execution_state(tp)
      @initial_value = evaluate_safely(tp.binding, @pre_execution_target)
    end

    def record_post_execution_result(tp)
      result_object = extract_result_from(tp)

      if @history.size < MAX_HISTORY_SIZE
        @history << { initial: @initial_value, result: result_object.inspect }
      end

      @last_value = result_object.inspect
      @initial_value = UNDEFINED
    end

    def extract_result_from(tp)
      if [:return, :c_return].include?(tp.event) && tp.method_id == target_method_name
        tp.return_value
      else
        target = (@kind == 'assignment') ? @pre_execution_target : @expression
        binding_to_use = @saved_binding || tp.binding
        binding_to_use.eval(target)
      end
    rescue
      "(error)"
    end

    def evaluate_safely(binding, expr)
      return nil unless expr
      binding.eval(expr).inspect
    rescue NameError
      @kind == 'assignment' ? "nil" : "(error)"
    rescue
      "(error)"
    end
  end

  def self.run(code, expression, target_line, kind, end_line, pre_execution_target, block_depth = nil, block_order = nil, block_start_line = nil)
    begin
      Session.new(expression, target_line, kind, end_line, pre_execution_target, block_depth, block_order, block_start_line).execute(code).to_json
    rescue Exception
      { history: [], lastValue: "(error)" }.to_json
    end
  end
end
