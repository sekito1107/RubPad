require "prism"
require "json"

module Picker
  VARIABLE_KEYWORDS = ["Variable", "Parameter", "Constant"]
  ASSIGNMENT_KEYWORDS = ["WriteNode", "TargetNode"]

  def self.run(code, line, col)
    result = Prism.parse(code)
    nodes = Selector.find_node(result.value, line, col)
    return {}.to_json if !nodes || nodes[:target].nil?

    target = nodes[:target]
    statement = nodes[:statement]

    kind = determine_kind(target.class.name.split('::').last)
    label = kind == 'expression' ? target.slice : target.name.to_s

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
      kind: kind
    }.to_json
  end

  private

  def self.determine_kind(node_type)
    return 'assignment' if ASSIGNMENT_KEYWORDS.any? { |kw| node_type.include?(kw) }
    return 'variable' if VARIABLE_KEYWORDS.any? { |kw| node_type.include?(kw) }
    'expression'
  end
end
