tp = TracePoint.new(:line) do |tp|
  puts "LINE: #{tp.lineno}"
end
tp.enable
puts "START"
x = 1
puts "END"
tp.disable
