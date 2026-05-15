require "test_helper"

class LiveVariablesTest < SystemTest
  def test_コード入力時にライブ変数がリアルタイムに評価されて右パネルに表示されること
    visit "/"
    wait_wasm_loading

    # SidebarのVariablesタブをクリック (CSSのuppercaseを考慮して大文字小文字を区別しない)
    find("button", text: /Variables/i).click

    # エディタにコードを入力
    find(".monaco-editor").click
    # Ctrl+A -> Backspace で全消去
    page.driver.browser.action.key_down(:control).send_keys("a").key_up(:control).send_keys(:backspace).perform
    
    # 簡単な変数定義
    send_keys("x = 42\n")
    send_keys("name = 'rubox'\n")

    # ライブ変数が表示されるのを待つ (自動評価の完了を待機)
    within "#live-variables-panel" do
      assert_text "x"
      assert_text "42"
      assert_text "name"
      assert_text '"rubox"'
    end
  end

  def test_無限ループが発生した場合に安全に中断され、直前までの変数が表示されること
    visit "/"
    wait_wasm_loading

    find("button", text: /Variables/i).click

    # エディタに無限ループになるコードを入力
    find(".monaco-editor").click
    page.driver.browser.action.key_down(:control).send_keys("a").key_up(:control).send_keys(:backspace).perform
    
    send_keys("a = 100\n")
    send_keys("loop {}")

    # 中断メッセージが表示されること
    within "#live-variables-panel" do
      assert_text "無限ループ" # Timeoutエラーの警告が出るか
      # ループ直前の変数aは取得できていること
      assert_text "a"
      assert_text "100"
    end
  end
end
