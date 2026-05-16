require_relative '../src/core/ruby/picker'
require_relative '../src/core/ruby/picker/selector'

code = <<~RUBY
array = [1, 2, 3]
result = []

array.each do |i|
    result << i * 2
end
RUBY

# Check 'result' at line 5, col 4 (start of result)
puts "Checking 'result' at line 5, col 4"
result = Picker.run(code, 5, 4)
puts JSON.pretty_generate(JSON.parse(result))

# Check '<<' at line 5, col 11
puts "\nChecking '<<' at line 5, col 11"
result = Picker.run(code, 5, 11)
puts JSON.pretty_generate(JSON.parse(result))
