require "json"
require "stringio"

module Inspector
  def self.run(code, expression, target_line, is_variable = false)
    history = []
    total_calls = 0
    last_value = nil
    
    current_before = nil
    current_binding = nil
    waiting_for_after = false

    tp = TracePoint.new(:line, :return, :b_return) do |t|
      if t.event == :line && t.lineno == target_line
        total_calls += 1
        begin
          val = t.binding.eval(expression).inspect
        rescue => e
          val = "(error)"
        end

        if is_variable
          current_before = val
          current_binding = t.binding
          waiting_for_after = true
        else
          if history.length < 10
            history << { initial: val, result: val }
          end
          last_value = val
        end
        next
      end

      if waiting_for_after
        begin
          after_val = current_binding.eval(expression).inspect
        rescue => e
          after_val = "(error)"
        end
        
        if history.length < 10
          history << { initial: current_before, result: after_val }
        end
        
        last_value = after_val
        waiting_for_after = false
        current_binding = nil
      end
    end

    original_stdout = $stdout
    original_stderr = $stderr
    $stdout = StringIO.new
    $stderr = StringIO.new

    # 実行ごとにクリーンなバインディングを作成し、変数の残留を防ぐ
    clean_binding = Object.new.instance_eval { binding }

    begin
      tp.enable do
        clean_binding.eval(code)
      end
    rescue => _e
    ensure
      $stdout = original_stdout
      $stderr = original_stderr
      tp.disable if tp.enabled?
    end

    { 
      history: history,
      totalCalls: total_calls,
      lastValue: last_value || "(not executed)"
    }.to_json
  end
end
