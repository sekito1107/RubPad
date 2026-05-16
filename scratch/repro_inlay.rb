require_relative '../src/core/ruby/inspector'
include Inspector

code = <<~RUBY
s = 'hi'
[1].each { |i| (s).upcase! }
RUBY

# Hovering 's' on line 2
session = Session.new("(s)", 2, 'variable', 2, nil)
result = session.execute(code)
puts "History for s: #{result[:history].inspect}"
