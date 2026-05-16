require_relative '../src/core/ruby/live_evaluator'
require 'json'

# テスト項目を絞る
code = "a = (1..50_000).to_a"

puts "Testing: Huge Array (50k elements)"
start_time = Time.now
result = LiveEvaluator.run(code)
end_time = Time.now

parsed = JSON.parse(result)
puts "Status: #{parsed['status']}"
puts "Variables count: #{parsed['variables'].size}"
parsed['variables'].each do |k, v|
  puts "  #{k}: length = #{v.length}"
end
puts "Total JSON length: #{result.length}"
puts "Time taken: #{end_time - start_time}s"
