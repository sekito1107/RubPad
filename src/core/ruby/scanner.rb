require 'prism'
require 'json'

module Scanner
  class MethodVisitor < Prism::Visitor
    def initialize
      @calls = []
    end

    # 通常のメソッド呼び出しを見つけたとき
    def visit_call_node(node)
      add_call(node.name.to_s, node.location)
      super
    end

    # &:to_s のようなショートハンドを見つけたとき
    def visit_block_argument_node(node)
      expression = node.expression
      if expression.is_a?(Prism::SymbolNode)
        add_call(expression.unescaped, expression.location)
      end
      super
    end

    def results
      @calls
    end

    private

    def add_call(name, location)
      @calls << {
        name: name,
        line: location.start_line,
        col: location.start_column
      }
    end
  end

  class << self
    def scan(code)
      return "[]" if code.nil? || code.empty?

      result = Prism.parse(code)
      return "[]" unless result.success?

      visitor = MethodVisitor.new
      result.value.accept(visitor)
      visitor.results.to_json
    end
  end
end
