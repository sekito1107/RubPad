require_relative '../src/core/ruby/live_evaluator'
require 'json'

def test(name, code)
  puts "Testing: #{name}"
  start_time = Time.now
  result = LiveEvaluator.run(code)
  end_time = Time.now
  
  parsed = JSON.parse(result)
  puts "Status: #{parsed['status']}"
  puts "Variables count: #{parsed['variables'].size}"
  # 最初の数文字だけ表示
  parsed['variables'].each do |k, v|
    puts "  #{k}: #{v[0..50]}#{v.length > 50 ? '...' : ''} (length: #{v.length})"
  end
  puts "Time taken: #{end_time - start_time}s"
  puts "-" * 20
rescue => e
  puts "Error during #{name}: #{e.message}"
  puts "-" * 20
end

# 1. 無限ループ (タイムアウトするはず)
test("Infinite Loop", "while true; end")

# 2. 巨大な文字列 (inspect が重いはず)
test("Huge String", "a = 'x' * 1_000_000")

# 3. 巨大な配列 (inspect が重いはず)
test("Huge Array", "a = (1..100_000).to_a")

# 4. 多数の変数
test("Many Variables", (1..1000).map { |i| "v#{i} = #{i}" }.join("\n"))

# 5. 循環参照 (Rubyのinspectは対応しているが...)
test("Circular Reference", "a = []; a << a")
