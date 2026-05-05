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
      @methods << create_entry(name, node)
    end

    def add_variable(name, node)
      @variables << create_entry(name, node)
    end

    def create_entry(name, node)
      query_loc = (node.message_loc if node.respond_to?(:message_loc)) || node.location
      info = resolve_info(query_loc)

      {
        name: name.to_s,
        line: query_loc.start_line,
        col: query_loc.start_column,
        info: info
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
        owner: service.hover("main.rb", pos),
        method_name: nil,
        owner_type: "class",
        is_singleton_call: false,
        has_instance: false,
        has_singleton: false
      }
      info
    end

    def method_call_node?(node)
      node.is_a?(Prism::CallNode) || node.is_a?(Prism::SymbolNode)
    end

    def resolve_method_call(node, service)
      info = nil
      node.boxes(:mcall) do |box|
        box.resolve(service.genv, nil) do |me, _ty, mid, orig_ty|
          info = extract_method_metadata(me, service)

          info[:owner] ||= orig_ty&.base_type(service.genv)&.show
          info[:method_name] = mid.to_s
        end
      end
      info
    end

    private

    def extract_method_metadata(me, service)
      return {} unless me

      # 公式定義 (decls) または 実定義 (defs) のいずれかから代表的な一つを取得
      # (TypeProf の内部的な Set クラスは .first を持たないため、一度配列化してから取得)
      source = me.decls.to_a.first || me.defs.to_a.first
      return {} unless source

      {
        owner: source.respond_to?(:cpath) ? source.cpath.join("::") : nil,
        owner_type: get_owner_type(source.mod, service),
        is_singleton_call: !!source&.singleton?,
        has_instance: !!source.mod&.get_method(me.mid, false),
        has_singleton: !!source.mod&.get_method(me.mid, true)
      }
    end

    def get_owner_type(mod, service)
      return "class" unless mod.respond_to?(:cpath)
      
      last_name = mod.cpath.last
      namespace = RBS::Namespace.new(path: mod.cpath[0...-1], absolute: true)
      typename = RBS::TypeName.new(name: last_name, namespace: namespace)
      
      decl = service.rbs_env.class_decls[typename]
      if decl && decl.entry.is_a?(RBS::Environment::ModuleEntry)
        "module"
      else
        "class"
      end
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
