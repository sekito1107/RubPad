require "json"

module Inspector
  def self.run(code, expression, target_line, is_variable = false)
    history = []
    total_calls = 0
    last_value = nil
    
    current_before = nil
    waiting_for_after = false

    tp = TracePoint.new(:line, :return, :b_return) do |t|
      # ターゲット行に到達（実行前）
      if t.event == :line && t.lineno == target_line
        total_calls += 1
        begin
          val = t.binding.eval(expression).inspect
        rescue => e
          val = "(error)"
        end

        if is_variable
          # 変数の場合は、変化を追うために「待ち」状態に入る
          current_before = val
          waiting_for_after = true
        else
          # 式の場合は、その瞬間の値を「事実」として即座に記録する
          if history.length < 10
            history << { initial: val, result: val }
          end
          last_value = val
        end
        next
      end

      # ターゲット行の実行完了（is_variable が true の場合のみここに来る）
      if waiting_for_after
        begin
          after_val = t.binding.eval(expression).inspect
        rescue => e
          after_val = "(error)"
        end
        
        if history.length < 10
          history << { initial: current_before, result: after_val }
        end
        
        last_value = after_val
        waiting_for_after = false
      end
    end

    begin
      tp.enable do
        TOPLEVEL_BINDING.eval(code)
      end
    rescue => _e
    ensure
      tp.disable if tp.enabled?
    end

    { 
      history: history,
      totalCalls: total_calls,
      lastValue: last_value || "(not executed)"
    }.to_json
  end
end
