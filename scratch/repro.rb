require_relative '../src/core/ruby/inspector'
require_relative '../src/core/ruby/inspector/environment'

code = <<~RUBY
array = [1, 2, 3]
result = []

array.each do |i|
    result << i * 2
end
RUBY

# result at line 5
# kind: block_variable
# expression: result
# pre_execution_target: result
# block_depth: 1
# block_order: 0
# block_start_line: 4

puts "Analyzing 'result' at line 5 (kind: block_variable)"
session = Inspector::Session.new("result", 5, "block_variable", 5, "result", 1, 0, 4)
report = session.execute(code)
puts "History:"
session.instance_variable_get(:@history).each do |h|
  puts "  #{h[:initial]} -> #{h[:result]}"
end

puts "\nAnalyzing 'result' at line 5 (kind: variable) - if it was not detected as block_variable"
session2 = Inspector::Session.new("result", 5, "variable", 5, "result")
report2 = session2.execute(code)
puts "History:"
session2.instance_variable_get(:@history).each do |h|
  puts "  #{h[:initial]} -> #{h[:result]}"
end
