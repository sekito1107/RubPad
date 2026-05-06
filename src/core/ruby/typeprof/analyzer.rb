require "prism"
require "typeprof"

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
      query_loc = (node.message_loc if node.respond_to?(:message_loc)) || node.location
      info = resolve_info(query_loc)

      @methods << {
        name: name.to_s,
        line: query_loc.start_line,
        col: query_loc.start_column,
        info: info
      }
    end

    def add_variable(name, node)
      loc = node.location
      @variables << {
        name: name.to_s,
        line: loc.start_line,
        col: loc.start_column
      }
    end

    def resolve_info(loc)
      return nil unless (service = @service)
      pos = TypeProf::CodePosition.new(loc.start_line, loc.start_column)

      # TypeProf 内部の解析済み AST キャッシュに直接アクセス (非公開 API)
      root = service.instance_variable_get(:@rb_text_nodes)["main.rb"]
      
      info = nil
      root&.retrieve_at(pos) do |n|
        if method_call_node?(n)
          info = resolve_method_call(n, service)
          break if info
        end
      end
      
      info ||= {
        owner: nil,
        owner_type: nil,
        is_singleton_call: false,
        has_instance: false,
        has_singleton: false
      }
      info
    end

    def method_call_node?(node)
      !!node&.boxes(:mcall) { break true }
    end

    def resolve_method_call(node, service)
      info = nil
      node.boxes(:mcall) do |box|
        box.resolve(service.genv, nil) do |me, _ty, mid, orig_ty|
          next unless me

          info = extract_method_metadata(me, service)
          info[:owner] ||= orig_ty&.base_type(service.genv)&.show
        end
      end
      info
    end

    private

    def extract_method_metadata(me, service)
      source = me.decls.to_a.first || me.defs.to_a.first
      mod = service.genv.resolve_cpath(source.cpath)

      # RBS の属性を取得 (SigDefNode#attrs)
      node = source.instance_variable_get(:@node)
      attrs = node&.respond_to?(:attrs) ? node.attrs : {}

      {
        owner: source.cpath.join("::"),
        owner_type: (mod&.module? ? "module" : "class"),
        is_singleton_call: !!source.singleton,
        has_instance: !!attrs[:instance],
        has_singleton: !!attrs[:singleton]
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
