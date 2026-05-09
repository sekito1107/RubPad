require "json"
require "stringio"
require "prism"

module Inspector
  class Session
    MAX_HISTORY_SIZE = 10
    UNDEFINED = Object.new # 未取得状態を厳密に表すためのトークン

    def initialize(expression, target_line, kind, end_line, pre_execution_target)
      @expression = expression
      @target_line = target_line
      @kind = kind
      @end_line = end_line
      @pre_execution_target = pre_execution_target
      
      @history = []
      @last_value = nil
      @initial_value = UNDEFINED
      @saved_binding = nil
    end

    def execute(code)
      observer = create_observer
      evaluate(code, observer)
      report
    end

    private

    def create_observer
      TracePoint.new(:line, :b_call, :return, :b_return, :c_return) do |tp|
        if initial_value_captured?
          record_post_execution_result(tp) if capture_ready?(tp)
        elsif reached_target_line?(tp)
          @saved_binding = tp.binding
          record_pre_execution_state(tp)
        end
      end
    end

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
      # 変数参照の場合は、ターゲット行に到達した時点ですでに準備完了
      return true if ['variable', 'block_variable'].include?(@kind)

      if target_method_name
         # メソッド呼び出しの場合は、そのメソッドの終了時が準備完了
        return [:return, :c_return].include?(tp.event) && tp.method_id == target_method_name
      end

      # その他（代入など）は、行の実行が終わった時が準備完了
      [:return, :c_return, :b_return].include?(tp.event) || (tp.event == :line && tp.lineno > @end_line)
    end

    def target_method_name
      return nil if ['variable', 'block_variable'].include?(@kind)
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

  def self.run(code, expression, target_line, kind, end_line, pre_execution_target)
    Session.new(expression, target_line, kind, end_line, pre_execution_target).execute(code).to_json
  end
end
