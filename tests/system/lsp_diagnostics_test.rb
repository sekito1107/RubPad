require "test_helper"

class LspDiagnosticsTest < SystemTest
  def setup
    visit "/"
    wait_wasm_loading
  end

  def test_不完全なコードを入力するとエラー波線が表示されること
    clear_editor
    send_keys("1 + ")

    assert_selector ".squiggly-error"
  end

  def test_エラーコードを修正すると波線が消えること
    clear_editor
    send_keys("1 + ")
    assert_selector ".squiggly-error"

    clear_editor
    send_keys("puts 'Hello'")

    assert_no_selector ".squiggly-error"
  end

  private

  def clear_editor
    find(".monaco-editor").click
    send_keys([:control, "a"], :backspace)
  end
end
