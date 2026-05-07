require "json"
require "stringio"

module Inspector
  def self.run(code, expression, target_line, kind, end_line)
    history = []
    last_value = nil
    
    current_before = nil
    current_binding = nil
    waiting_for_after = false

    tp = TracePoint.new(:line, :return, :b_return, :b_call) do |t|
      if target_event?(t, kind, target_line)
        begin
          val = t.binding.eval(expression).inspect
        rescue NameError
          if kind == 'variable' || kind == 'assignment'
            current_before = nil
            current_binding = t.binding
            waiting_for_after = true
            next
          end
          val = "(error)"
        rescue => e
          val = "(error)"
        end

        if kind == 'assignment'
          current_before = val
          current_binding = t.binding
          waiting_for_after = true
        else
          if history.length < 10
            history << { initial: nil, result: val }
          end
          last_value = val
        end
        next
      end

      if waiting_for_after
        if t.lineno > end_line || t.event == :return
          begin
            after_val = current_binding.eval(expression).inspect
            if history.length < 10
              history << { initial: current_before, result: after_val }
            end
            last_value = after_val
          rescue => e
          end
          waiting_for_after = false
        end
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
      if waiting_for_after
        begin
          after_val = current_binding.eval(expression).inspect
          history << { initial: current_before, result: after_val } if history.length < 10
          last_value = after_val
        rescue => _e
        end
      end
      $stdout = original_stdout
      $stderr = original_stderr
      tp.disable if tp.enabled?
    end

    { 
      history: history,
      lastValue: last_value || "(not executed)"
    }.to_json
  end

  def self.target_event?(tp, kind, target_line)
    return false if tp.lineno != target_line

    if kind == 'expression'
      tp.event == :line
    else
      tp.event == :line || tp.event == :b_call
    end
  end
  private_class_method :target_event?
end
