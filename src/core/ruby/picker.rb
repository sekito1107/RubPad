require "prism"
require "json"

module Picker
  BLOCK_VARIABLE_KEYWORDS = ["Parameter"]
  VARIABLE_KEYWORDS = ["Variable", "Constant"]
  ASSIGNMENT_KEYWORDS = ["WriteNode", "TargetNode"]

  def self.run(code, line, col)
    begin
      result = Prism.parse(code)
      nodes = Selector.find_node(result.value, line, col)
      return {}.to_json if !nodes || nodes[:target].nil?

      target = nodes[:target]

      # パラメータ宣言ノード（|b|など）の場合はホバーを無効化する
      node_type = target.class.name.split('::').last
      return {}.to_json if BLOCK_VARIABLE_KEYWORDS.any? { |kw| node_type.include?(kw) }
      statement = nodes[:statement]
      label_loc = target.respond_to?(:message_loc) ? target.message_loc : nil

      kind = determine_kind(target.class.name.split('::').last, nodes[:path])
      label = kind == 'expression' ? target.slice : target.name.to_s
      pre_execution_target = determine_pre_execution_target(target, kind)

      block_depth = nil
      block_order = nil
      block_start_line = nil
      if kind == 'block_variable'
        block_depth, block_order = calculate_block_info(result.value, nodes[:path], target.location.start_line)
        block_start_line = collect_block_start_line(result.value, nodes[:path])
      end

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
        receiver: (target.respond_to?(:receiver) && target.receiver) ? target.receiver.slice : nil,
        preExecutionTarget: pre_execution_target,
        blockDepth: block_depth,
        blockOrder: block_order,
        blockStartLine: block_start_line
      }.to_json
    rescue Exception
      {}.to_json
    end
  end

  private

  def self.determine_pre_execution_target(target, kind)
    if target.respond_to?(:receiver) && target.receiver
      target.receiver.slice
    elsif (kind == 'assignment' || kind == 'variable' || kind == 'block_variable') && target.respond_to?(:name)
      target.name.to_s
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

  # block_variable のブロック識別情報を算出する
  # @return [depth, order] の配列
  def self.calculate_block_info(root, path, target_line)
    depth = path.count { |n|
      t = n.class.name.split('::').last
      t == 'BlockNode' || t == 'LambdaNode'
    }
    enc = path.reverse.find { |n|
      t = n.class.name.split('::').last
      t == 'BlockNode' || t == 'LambdaNode'
    }
    blocks = collect_blocks_at_depth(root, target_line, depth)
    order = blocks.index(enc)
    [depth, order]
  end

  # path 内の最も内側のブロックの開始行を返す
  def self.collect_block_start_line(root, path)
    enc = path.reverse.find { |n|
      t = n.class.name.split('::').last
      t == 'BlockNode' || t == 'LambdaNode'
    }
    enc&.location&.start_line
  end

  # target_line を含む範囲にある target_depth の BlockNode/LambdaNode を DFS 順で収集する
  def self.collect_blocks_at_depth(node, target_line, target_depth, cur_depth = 0, result = [])
    return result unless node
    t = node.class.name.split('::').last
    if t == 'BlockNode' || t == 'LambdaNode'
      nd = cur_depth + 1
      # 修正: start_line 一致ではなく、target_line を含む範囲で検索
      if nd == target_depth &&
         node.location.start_line <= target_line &&
         node.location.end_line >= target_line
        result << node
      end
      node.child_nodes.compact.each { |c| collect_blocks_at_depth(c, target_line, target_depth, nd, result) }
    else
      node.child_nodes.compact.each { |c| collect_blocks_at_depth(c, target_line, target_depth, cur_depth, result) }
    end
    result
  end
end
