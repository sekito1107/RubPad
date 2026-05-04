module Rubox
  def self.run(code)
    $stdout = $stderr = StringIO.new
    
    begin
      eval(code)
    rescue Exception => e
      warn e.full_message
    end
    
    $stdout.string
  end
end
