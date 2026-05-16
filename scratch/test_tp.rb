count = 0
tp = TracePoint.new(:line, :call, :b_call, :c_call) { count += 1; raise "stop" if count > 10 }
begin
  tp.enable do
    while true
      1
    end
  end
rescue => e
  puts "Stopped with: #{e.message}"
  puts "Count: #{count}"
end
