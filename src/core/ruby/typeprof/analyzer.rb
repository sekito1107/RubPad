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
      # メソッド名そのものの座標 (message_loc) を優先することで、ピンポイントな解析を可能にする
      query_loc = (node.message_loc if node.respond_to?(:message_loc)) || node.location
      type_info = resolve_type_info(query_loc)

      {
        name: name.to_s,
        line: query_loc.start_line,
        col: query_loc.start_column,
        type_info: type_info
      }
    end

    def resolve_type_info(loc)
      return nil unless (service = @service)

      pos = TypeProf::CodePosition.new(loc.start_line, loc.start_column)
      # TypeProf 内部の解析済み AST キャッシュに直接アクセス (非公開 API)
      root = service.instance_variable_get(:@rb_text_nodes)["main.rb"]
      
      type_info = nil
      # retrieve_at で最も内側のノードから探索し、精密なメソッド解決を優先する
      root&.retrieve_at(pos) do |n|
        if method_call_node?(n)
          type_info = resolve_method_call(n, service)
          break if type_info
        end
      end
      
      type_info ||= service.hover("main.rb", pos)
    end

    def method_call_node?(node)
      node.respond_to?(:boxes) && node.boxes(:mcall) { break true }
    end

    def resolve_method_call(node, service)
      info = nil
      node.boxes(:mcall) do |box|
        box.resolve(service.genv, nil) do |me, _ty, mid, orig_ty|
          owner = find_method_owner(me)
          
          if owner
            info = "#{owner}##{mid}"
          elsif orig_ty
            base_ty = orig_ty.base_type(service.genv)
            info = "#{base_ty.show}##{mid}"
          end
        end
      end
      info
    end

    def find_method_owner(me)
      return nil unless me
      
      # 公式定義 (decls) または 実定義 (defs) のいずれかから代表的な一つを取得
      # (TypeProf の内部的な Set クラスは .first を持たないため、一度配列化してから取得)
      target = me.decls.to_a.first || me.defs.to_a.first
      
      target.respond_to?(:cpath) ? target.cpath.join("::") : nil
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
