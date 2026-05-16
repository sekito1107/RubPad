require_relative '../src/core/ruby/inspector'
require_relative '../src/core/ruby/inspector/environment'

code = <<~RUBY
array = [1, 2]
result = []
array.each { |i| result << i * 2 }
RUBY

# line 3, block_variable 'result'
session = Inspector::Session.new("result", 3, "block_variable", 3, "result", 1, 0, 3)
report = session.execute(code)
puts "History for 'result' (initial values):"
report[:history].each do |h|
  puts "  initial: #{h[:initial]}, result: #{h[:result]}"
end
