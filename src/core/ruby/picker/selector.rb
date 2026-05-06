class Selector
  COLLECTION_NODES = [
    'ArrayNode',
    'HashNode',
    'RangeNode',
    'CallNode'
  ]

  LITERAL_NODES = [
    'IntegerNode',
    'FloatNode',
    'SymbolNode',
    'StringNode',
    'RationalNode',
    'ImaginaryNode'
  ]

  def self.find_node(root, line, col)
    path = []
    found = search_path(root, line, col, path)
    return nil unless found

    leaf = path.last
    leaf_type = leaf.class.name.split('::').last

    if LITERAL_NODES.include?(leaf_type)
      target = path.reverse.find do |node|
        COLLECTION_NODES.include?(node.class.name.split('::').last)
      end
      return target if target
    end
    leaf
  end

  private

  def self.search_path(node, line, col, path)
    return false unless node
    return false unless inside?(node, line, col)

    path << node

    node.child_nodes.compact.each do |child|
      return true if search_path(child, line, col, path)
    end

    true
  end

  def self.inside?(node, line, col)
    loc = node.location
    return false if line < loc.start_line || line > loc.end_line
    if line == loc.start_line
      return false if col < loc.start_column
    end
    if line == loc.end_line
      return false if col >= loc.end_column
    end
    true
  end
end
