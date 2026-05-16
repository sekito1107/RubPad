require "json"
require "stringio"
require "prism"

module Inspector
  class Session
    MAX_HISTORY_SIZE = 10
    UNDEFINED = Object.new # 未取得状態を厳密に表すためのトークン

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

    def create_block_variable_observer
      current_depth = 0
      block_idx     = 0
      in_my_block   = false
      prev_locals   = nil
      pre_captured  = false
      match_line = @block_start_line || @target_line

      TracePoint.new(:b_call, :b_return, :line) do |tp|
        # puts "DEBUG: event=#{tp.event} line=#{tp.lineno} depth=#{current_depth} in_my_block=#{in_my_block} target_depth=#{@block_depth}"
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
              if match_line == @target_line
                record_pre_execution_state(tp)
                pre_captured = true
              end
            end
          end
          current_depth += 1

        when :line
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

    def create_default_observer
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
        # Environment.prepare(code, clean_binding)
        observer.enable { clean_binding.eval(code) }
      rescue Exception => e
        # puts "DEBUG: eval error: #{e.message}"
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

    def initial_value_captured?
      @initial_value != UNDEFINED
    end

    def reached_target_line?(tp)
      return false if tp.lineno != @target_line
      @kind == 'block_variable' ? tp.event == :b_call : tp.event == :line
    end

    def capture_ready?(tp)
      return true if ['variable', 'block_variable'].include?(@kind)
      if target_method_name
        return [:return, :c_return].include?(tp.event) && tp.method_id == target_method_name
      end
      if @kind == 'assignment'
        return (tp.event == :line && tp.lineno > @end_line) || (tp.event == :c_return && tp.method_id == :eval)
      end
      [:return, :c_return, :b_return].include?(tp.event) || (tp.event == :line && tp.lineno > @end_line)
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
    Session.new(expression, target_line, kind, end_line, pre_execution_target, block_depth, block_order, block_start_line).execute(code).to_json
  end
end
