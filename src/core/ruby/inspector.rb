require "json"
require "stringio"

module Inspector
  # インスペクト（値のキャプチャ）の一連のプロセスを管理するクラス
  class Session
    MAX_HISTORY_SIZE = 10
    UNDEFINED = Object.new # 未取得状態を厳密に表すためのトークン

    def initialize(expression, target_line, kind, end_line, pre_execution_target)
      @expression = expression
      @target_line = target_line
      @kind = kind
      @end_line = end_line
      @pre_execution_target = pre_execution_target # 実行前の状態を測る対象（レシーバや変数名）
      
      @history = []
      @last_value = nil
      @initial_value = UNDEFINED
    end

    # メインの実行フロー（作成 -> 評価 -> 報告）
    def execute(code)
      observer = create_observer
      evaluate(code, observer)
      report
    end

    private

    # 1. 監視ルールの作成
    def create_observer
      TracePoint.new(:line, :return, :b_return) do |tp|
        if initial_value_captured?
          # すでに開始前の値を持っているなら、実行完了を待って結果を記録する
          record_post_execution_result(tp) if execution_finished?(tp)
        elsif reached_target_line?(tp)
          # まだ持っていないなら、ターゲット行で開始前の値をキャプチャする
          record_pre_execution_state(tp)
        end
      end
    end

    # 2. コードを評価し、値をキャプチャする
    def evaluate(code, observer)
      original_stdout, original_stderr = $stdout, $stderr
      $stdout, $stderr = StringIO.new, StringIO.new

      begin
        clean_binding = Object.new.instance_eval { binding }
        observer.enable { clean_binding.eval(code) }
      rescue
        # 実行時エラーはここでは捕捉しない
      ensure
        $stdout, $stderr = original_stdout, original_stderr
        observer.disable if observer.enabled?
      end
    end

    # 3. 結果を報告する
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
      tp.event == :line && tp.lineno == @target_line
    end

    def execution_finished?(tp)
      [:return, :b_return].include?(tp.event) || (tp.event == :line && tp.lineno > @end_line)
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
      @initial_value = UNDEFINED # 次のループ（実行）に備えてリセット
    end

    def extract_result_from(tp)
      if [:return, :b_return].include?(tp.event)
        tp.return_value # 実際に生成された戻り値を直接取得（副作用なし）
      else
        # 代入時など、戻り値イベントが出ない場合のフォールバック
        target = (@kind == 'assignment') ? @pre_execution_target : @expression
        tp.binding.eval(target)
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

  # エントリポイント
  def self.run(code, expression, target_line, kind, end_line, pre_execution_target)
    Session.new(expression, target_line, kind, end_line, pre_execution_target).execute(code).to_json
  end
end
