require "json"

module Diagnostics
  class << self
    def run(code)
      begin
        TypeProfEngine.init unless (service = TypeProfEngine.service)
        return "[]" unless (service ||= TypeProfEngine.service)

        begin
          RubyVM::InstructionSequence.compile(code)
        rescue SyntaxError => e
          return [format_syntax_error(e, code)].to_json
        rescue
        end

        service.update_rb_file("main.rb", code)

        results = []
        service.diagnostics("main.rb") { |result| results << result.to_lsp }
        results.to_json
      rescue => e
        "[]"
      end
    end

    private

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
