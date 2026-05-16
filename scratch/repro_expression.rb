require_relative '../src/core/ruby/inspector'
require_relative '../src/core/ruby/inspector/environment'

code = <<~RUBY
array = [1, 2, 3]
result = []

array.each do |i|
    result << i * 2
end
RUBY

puts "Analyzing 'result << i * 2' at line 5 (kind: expression)"
session = Inspector::Session.new("result << i * 2", 5, "expression", 5, "result")
report = session.execute(code)
puts "History:"
session.instance_variable_get(:@history).each do |h|
  puts "  #{h[:initial]} -> #{h[:result]}"
end
