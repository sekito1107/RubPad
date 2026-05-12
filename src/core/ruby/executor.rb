require "stringio"

module Executor
  def self.run(code)
    $stdin = StringIO.new($rubox_stdin || "")
    output = StringIO.new
    $stdout = $stderr = output
    begin 
      Object.new.instance_eval { binding }.eval(code)
    rescue Exception => e
      warn e.full_message
    ensure
      $stdout = STDOUT
      $stderr = STDERR
    end
    output.string
  end
end
