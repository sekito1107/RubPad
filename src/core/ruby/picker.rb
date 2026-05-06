require "prism"
require "json"

module Picker
  def self.run(code, line, col)
    result = Prism.parse(code)
    node = Selector.find_node(result.value, line, col)
    return {}.to_json unless node

    {
      expression: node.slice,
      line: node.location.start_line,
      col: node.location.start_column
    }.to_json
  end
end
