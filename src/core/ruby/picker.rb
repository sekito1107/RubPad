require "prism"
require "json"

module Picker
  def self.run(code, line, col)
    result = Prism.parse(code)
    node = Selector.find_node(result.value, line, col)
    return {}.to_json unless node

    node_type = node.class.name.split('::').last
    is_variable = node_type.end_with?("WriteNode") || node_type.end_with?("TargetNode")

    if is_variable
      expression = node.name.to_s
      loc = node.name_loc
    else
      expression = node.slice
      loc = node.location
    end

    {
      expression: expression,
      line: loc.start_line,
      col: loc.start_column,
      isVariable: is_variable
    }.to_json
  end
end
