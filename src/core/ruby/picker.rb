require "prism"
require "json"

module Picker
  BLOCK_VARIABLE_KEYWORDS = ["Parameter"]
  VARIABLE_KEYWORDS = ["Variable", "Constant"]
  ASSIGNMENT_KEYWORDS = ["WriteNode", "TargetNode"]

  def self.run(code, line, col)
    result = Prism.parse(code)
    nodes = Selector.find_node(result.value, line, col)
    return {}.to_json if !nodes || nodes[:target].nil?

    target = nodes[:target]
    statement = nodes[:statement]
    label_loc = target.respond_to?(:message_loc) ? target.message_loc : nil

    kind = determine_kind(target.class.name.split('::').last, nodes[:path])
    label = kind == 'expression' ? target.slice : target.name.to_s
    pre_execution_target = determine_pre_execution_target(target, kind)

    {
      label: label,
      content: statement.slice,
      line: target.location.start_line,
      col: target.location.start_column,
      labelLine: label_loc&.start_line,
      labelCol: label_loc&.start_column,
      contentLine: statement.location.start_line,
      contentCol: statement.location.start_column,
      endLine: statement.location.end_line,
      endCol: statement.location.end_column,
      kind: kind,
      expression: target.slice,
      receiver: pre_execution_target
    }.to_json
  end

  private

  def self.determine_pre_execution_target(target, kind)
    if target.respond_to?(:receiver) && target.receiver
      target.receiver.slice
    else
      false
    end
  end

  def self.determine_kind(node_type, path)
    return 'assignment' if ASSIGNMENT_KEYWORDS.any? { |kw| node_type.include?(kw) }
    
    if BLOCK_VARIABLE_KEYWORDS.any? { |kw| node_type.include?(kw) } ||
       (VARIABLE_KEYWORDS.any? { |kw| node_type.include?(kw) } && 
        path.any? { |n| n.class.name.include?('BlockNode') || n.class.name.include?('LambdaNode') })
      return 'block_variable'
    end

    return 'variable' if VARIABLE_KEYWORDS.any? { |kw| node_type.include?(kw) }
    'expression'
  end
end
