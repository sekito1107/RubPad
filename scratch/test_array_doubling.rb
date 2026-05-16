require_relative '../src/core/ruby/live_evaluator'
require 'json'

code = <<~RUBY
  a = [1]
  20.times { a += a }
RUBY

puts "Testing: Array doubling (2^20 elements)"
start_time = Time.now
result = LiveEvaluator.run(code)
end_time = Time.now

parsed = JSON.parse(result)
puts "Status: #{parsed['status']}"
a_val = parsed['variables']['a']
puts "a.inspect length: #{a_val.length}"
puts "Time taken: #{end_time - start_time}s"
