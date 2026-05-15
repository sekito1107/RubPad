$rubox_stdin ||= ""

module Stdin
  def self.update(input)
    $rubox_stdin = input
    $stdin = StringIO.new($rubox_stdin)
  end
end
