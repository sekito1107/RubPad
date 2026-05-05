require "json"

module Analyzer
  class Visitor < Prism::Visitor
    def initialize(service)
      @service = service
      @methods = []
      @variables = []
    end

    def results
      { methods: @methods, variables: @variables }
    end

    def visit_call_node(node)
      add_method(node.name, node)
      super
    end

    def visit_local_variable_write_node(node)
      add_variable(node.name, node)
      super
    end

    def visit_block_argument_node(node)
      expression = node.expression
      if expression.is_a?(Prism::SymbolNode)
        add_method(expression.unescaped, expression)
      end
      super
    end

    private

    def add_method(name, node)
      @methods << create_entry(name, node)
    end

    def add_variable(name, node)
      @variables << create_entry(name, node)
    end

    def create_entry(name, node)
      # メソッド呼び出しの場合はメソッド名の位置を優先し、それ以外はノードの開始位置を使用する
      query_loc = (node.message_loc if node.respond_to?(:message_loc)) || node.location
      pos = TypeProf::CodePosition.new(query_loc.start_line - 1, query_loc.start_column)
      {
        name: name.to_s,
        line: query_loc.start_line,
        col: query_loc.start_column,
        type_info: @service&.hover("main.rb", pos)
      }
    end
  end

  class << self
    def run(code)
      TypeProfEngine.update(code)
      return { methods: [], variables: [] }.to_json unless (service = TypeProfEngine.service)

      result = Prism.parse(code)
      return { methods: [], variables: [] }.to_json unless result.success?

      visitor = Visitor.new(service)
      result.value.accept(visitor)
      
      visitor.results.to_json
    end
  end
end
