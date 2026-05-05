require 'prism'
require 'json'

module Scanner
  class AnalysisVisitor < Prism::Visitor
    def initialize
      @methods = []
      @variables = []
    end

    def visit_call_node(node)
      @methods << {
        name: node.name.to_s,
        line: node.location.start_line,
        col: node.location.start_column
      }
      super
    end

    def visit_local_variable_write_node(node)
      @variables << {
        name: node.name.to_s,
        line: node.location.start_line,
        col: node.location.start_column
      }
      super
    end

    def visit_block_argument_node(node)
      expression = node.expression
      if expression.is_a?(Prism::SymbolNode)
        @methods << {
          name: expression.unescaped,
          line: expression.location.start_line,
          col: expression.location.start_column
        }
      end
      super
    end

    def results
      { methods: @methods, variables: @variables }
    end
  end

  class << self
    def scan(code)
      fallback = { methods: [], variables: [] }.to_json
      return fallback if code.nil? || code.empty?

      result = Prism.parse(code)
      return fallback unless result.success?

      visitor = AnalysisVisitor.new
      result.value.accept(visitor)
      visitor.results.to_json
    end
  end
end
