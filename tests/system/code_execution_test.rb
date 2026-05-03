require "test_helper"

class CodeExecutionTest < SystemTest
  def test_Rubyコードを入力して実行し出力が表示されること
    visit "/"

    assert_selector "#run-button:not([disabled])"

    find(".monaco-editor").click
    send_keys([:control, "a"], :backspace)
    send_keys("puts 'Hello Rubox'")

    click_on "run-button"

    within "#terminal-panel" do
      assert_text "Hello Rubox"
    end
  end

  def test_不正なRubyコードを実行した際にエラーが出力されること
    visit "/"

    assert_selector "#run-button:not([disabled])"

    find(".monaco-editor").click
    send_keys([:control, "a"], :backspace)
    send_keys("1 +")

    click_on "run-button"

    within "#terminal-panel" do
      assert_text "syntax error"
    end
  end
end
