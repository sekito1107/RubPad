require "json"

module TypeProf
  class Analyzer < Prism::Visitor
    def initialize(service)
      @service = service
      @methods = []
      @variables = []
    end

    def results
      { methods: @methods, variables: @variables }
    end

    def visit_call_node(node)
      res = @service.hover("main.rb", node.location.start_line - 1, node.location.start_column)
      @methods << {
        name: node.name.to_s,
        line: node.location.start_line,
        col: node.location.start_column,
        type_info: res
      }
      super
    end

    def visit_local_variable_write_node(node)
      res = @service.hover("main.rb", node.location.start_line - 1, node.location.start_column)
      @variables << {
        name: node.name.to_s,
        line: node.location.start_line,
        col: node.location.start_column,
        type_info: res
      }
      super
    end

    def visit_block_argument_node(node)
      expression = node.expression
      if expression.is_a?(Prism::SymbolNode)
        res = @service.hover("main.rb", expression.location.start_line - 1, expression.location.start_column)
        @methods << {
          name: expression.unescaped,
          line: expression.location.start_line,
          col: expression.location.start_column,
          type_info: res
        }
      end
      super
    end
  end

  class << self
    def run(code)
      TypeProfEngine.update(code)
      return { methods: [], variables: [] }.to_json unless (service = TypeProfEngine.service)

      result = Prism.parse(code)
      return { methods: [], variables: [] }.to_json unless result.success?

      visitor = Analyzer.new(service)
      result.value.accept(visitor)
      
      visitor.results.to_json
    end
  end
end
