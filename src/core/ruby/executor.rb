require "stringio"

module Executor
  def self.run(code)
    $stdin = StringIO.new($rubox_stdin || "")
    output = StringIO.new
    $stdout = $stderr = output
    begin 
      sandbox_class = Class.new
      sandbox_class.class_eval(<<~RUBY)
        def get_binding
          binding
        end
      RUBY
      sandbox_class.new.get_binding.eval(code)
    rescue Exception => e
      warn e.full_message
    ensure
      $stdout = STDOUT
      $stderr = STDERR
    end
    output.string
  end
end
