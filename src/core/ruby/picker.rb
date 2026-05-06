require "prism"
require "json"

module Picker
  def self.run(code, line, col)
    result = Prism.parse(code)
    nodes = Selector.find_node(result.value, line, col)
    return {}.to_json unless nodes

    target = nodes[:target]
    statement = nodes[:statement]

    node_type = target.class.name.split('::').last
    is_variable = node_type.end_with?("WriteNode") || node_type.end_with?("TargetNode")

    if is_variable
      label = target.name.to_s
    else
      label = target.slice
    end

    content = statement.slice
    target_loc = target.location
    statement_loc = statement.location

    {
      label: label,
      content: content,
      line: target_loc.start_line,
      col: target_loc.start_column,
      contentLine: statement_loc.start_line,
      contentCol: statement_loc.start_column,
      endLine: statement_loc.end_line,
      endCol: statement_loc.end_column,
      isVariable: is_variable
    }.to_json
  end
end
