$LOADED_FEATURES << "socket" << "io/console"

require "js"
require "pathname"
require "rubygems"
require "rbs"
require "typeprof"
require "typeprof/lsp"
require "json"

module Diagnostics
  class << self
    def init
      return if @service || @initializing
      @initializing = true

      JS.global.fetch("/rbs/ruby-stdlib.rbs")
        .then { |res| res.text }
        .then do |rbs_data|
          File.write("/stdlib.rbs", rbs_data.to_s)

          loader = RBS::EnvironmentLoader.new(core_root: nil)
          loader.add(path: Pathname.new("/stdlib.rbs"))
          @service = TypeProf::Core::Service.new(rbs_env: RBS::Environment.from_loader(loader))

          @initializing = false
        end
    end

    def run(code)
      init unless @service
      return "[]" unless @service

      begin
        RubyVM::InstructionSequence.compile(code)
      rescue SyntaxError => e
        return [format_syntax_error(e, code)].to_json
      rescue
      end

      @service.update_rb_file("main.rb", code)

      results = []
      @service.diagnostics("main.rb") { |result| results << result.to_lsp }
      results.to_json
    end

    private

    # RubyVM の SyntaxError を LSP (Language Server Protocol) 形式に変換する
    def format_syntax_error(e, code)
      msg = e.message

      # エラーメッセージから行番号と内容を抽出する
      # e.g., "(eval):10: syntax error..." -> $1="10", $2="syntax error..."
      msg =~ /:(\d+): (.*)/
      line = $1.to_i - 1
      msg = $2

      lines = code.split("\n")
      line_content = lines[line] || ""

      {
        range: {
          start: { line: line, character: 0 },
          end: { line: line, character: line_content.length }
        },
        severity: 1, # Error
        message: msg,
        source: "RubyVM"
      }
    end
  end
end
