require "prism"
require "set"

module Inspector
  module Environment
    # 起動時のグローバル変数の状態を記録 (不変の初期状態)
    def self.initial_global_states
      @initial_global_states ||= global_variables.each_with_object({}) do |var, hash|
        begin
          # 特殊なグローバル変数 ($!, $@ 等) も含め、取得可能な初期値を保存
          hash[var] = eval(var.to_s)
        rescue
          # 読み取り不可なものはスキップ
        end
      end.freeze
    end

    # 実行直前の環境準備を行う
    def self.prepare(code, binding)
      # 1. コードを解析して、書き換えられるグローバル変数を特定
      targets = VariableScanner.scan(code)
      
      # 2. 特定された変数のみを「原初の値」にロールバック
      states = initial_global_states
      targets.each do |name|
        # 原初リストにある場合はその値を、ない場合は nil をセット
        initial_value = states.fetch(name.to_sym, nil)
        
        begin
          # システム変数を破壊しないよう、慎重に eval で戻す
          binding.eval("#{name} = #{initial_value.inspect}")
        rescue
          # 読み取り専用や代入不可なシステム変数は無視
        end
      end
    end

    # Prism を使って、コード内で書き換えられるグローバル変数を抽出する Visitor
    class VariableScanner < Prism::Visitor
      def self.scan(code)
        result = Prism.parse(code)
        return [] unless result.success?

        scanner = new
        result.value.accept(scanner)
        scanner.targets.to_a
      end

      attr_reader :targets

      def initialize
        @targets = Set.new
      end

      def visit_global_variable_write_node(node)
        @targets << node.name
        super
      end

      def visit_global_variable_target_node(node)
        @targets << node.name
        super
      end

      def visit_global_variable_operator_write_node(node)
        @targets << node.name
        super
      end

      def visit_global_variable_or_write_node(node)
        @targets << node.name
        super
      end

      def visit_global_variable_and_write_node(node)
        @targets << node.name
        super
      end
    end
  end
end
