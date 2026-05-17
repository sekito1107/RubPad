require "test_helper"

class CodeExecutionTest < SystemTest
  def test_Rubyコードを入力して実行し出力が表示されること
    visit "/"

    wait_wasm_loading

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

    wait_wasm_loading

    find(".monaco-editor").click
    send_keys([:control, "a"], :backspace)
    send_keys("1 +")

    click_on "run-button"

    within "#terminal-panel" do
      assert_text "syntax error"
    end
  end

  def test_ショートカットキーCtrl_Enterでコードを実行できること
    visit "/"
    wait_wasm_loading

    find(".monaco-editor").click
    send_keys([:control, "a"], :backspace)
    send_keys("puts 'Shortcut Worked'")
    send_keys([:control, :enter])

    within "#terminal-panel" do
      assert_text "Shortcut Worked"
    end
  end

  def test_定数を定義したコードを複数回実行しても警告が出力されないこと
    visit "/"
    wait_wasm_loading

    find(".monaco-editor").click
    send_keys([:control, "a"], :backspace)
    send_keys("LIMIT = 100\nputs LIMIT")

    # 1回目の実行
    click_on "run-button"
    within "#terminal-panel" do
      assert_text "100"
    end

    # 2回目の実行
    click_on "run-button"
    within "#terminal-panel" do
      refute_text "already initialized constant"
    end
  end
end
