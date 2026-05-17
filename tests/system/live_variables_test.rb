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

  def test_定数を定義したコード入力時に定数もライブ変数としてパネルに表示されること
    visit "/"
    wait_wasm_loading

    # SidebarのVariablesタブをクリック (CSSのuppercaseを考慮して大文字小文字を区別しない)
    find("button", text: /Variables/i).click

    # エディタにコードを入力
    find(".monaco-editor").click
    page.driver.browser.action.key_down(:control).send_keys("a").key_up(:control).send_keys(:backspace).perform
    
    # 定数定義を入力
    send_keys("MY_CONST = 'hello'\n")

    # 定数が表示されるのを待つ (自動評価の完了を待機)
    within "#live-variables-panel" do
      assert_text "MY_CONST"
      assert_text '"hello"'
    end
  end

  def test_コード実行中にエラーが発生した場合でもエラー手前までのライブ変数が表示されること
    visit "/"
    wait_wasm_loading

    # SidebarのVariablesタブをクリック (CSSのuppercaseを考慮して大文字小文字を区別しない)
    find("button", text: /Variables/i).click

    # エディタにコードを入力
    find(".monaco-editor").click
    page.driver.browser.action.key_down(:control).send_keys("a").key_up(:control).send_keys(:backspace).perform
    
    # 途中で例外が発生するコードを入力
    send_keys("err_var = 12345\n")
    
    # 確実に評価が走って保存されるのを待つ
    within "#live-variables-panel" do
      assert_text "err_var"
      assert_text "12345"
    end

    # 例外を発生させるコードを追加 (フォーカスを戻す)
    find(".monaco-editor").click
    send_keys("raise 'intentional error'\n")
    send_keys("after_var = 999\n")

    # 例外発生前までの変数は表示されるが、例外発生以後の代入結果は反映されないことを検証
    within "#live-variables-panel" do
      assert_text "err_var"
      assert_text "12345"
      # after_var の代入行は実行されていないため、999 にはなっていないことを検証
      refute_text "999"
    end
  end

  def test_構文エラーが発生したタイピング中のコードでも直前の変数が維持されエラー名が表示されること
    visit "/"
    wait_wasm_loading

    find("button", text: /Variables/i).click

    find(".monaco-editor").click
    page.driver.browser.action.key_down(:control).send_keys("a").key_up(:control).send_keys(:backspace).perform
    
    # 正常なコードを入力して変数が表示されるのを待つ
    send_keys("x = 42\n")
    within "#live-variables-panel" do
      assert_text "x"
      assert_text "42"
    end

    # 意図的にタイピング中の不完全なコード（構文エラー）を追記 (フォーカスを戻す)
    find(".monaco-editor").click
    send_keys("def valid_")

    # 構文エラーになっても、直前までの変数が維持され、かつエラー警告UIが表示されることを検証
    within "#live-variables-panel" do
      assert_text "x"
      assert_text "42"
      
      # エラー警告領域が表示され、SyntaxErrorが含まれていることを検証
      assert_selector "#live-eval-error-alert"
      within "#live-eval-error-alert" do
        assert_text "SyntaxError"
      end
    end
  end

  def test_実行時に例外が発生した場合にエラー名とメッセージが表示され変数が維持されること
    visit "/"
    wait_wasm_loading

    find("button", text: /Variables/i).click

    find(".monaco-editor").click
    page.driver.browser.action.key_down(:control).send_keys("a").key_up(:control).send_keys(:backspace).perform
    
    # 正常なコードを入力して変数が表示されるのを待つ
    send_keys("y = 100\n")
    within "#live-variables-panel" do
      assert_text "y"
      assert_text "100"
    end

    # NoMethodErrorを発生させるコードを追加 (フォーカスを戻す)
    find(".monaco-editor").click
    send_keys("y.undefined_method")

    # 変数が維持され、かつNoMethodError警告が表示されることを検証
    within "#live-variables-panel" do
      assert_text "y"
      assert_text "100"
      
      assert_selector "#live-eval-error-alert"
      within "#live-eval-error-alert" do
        assert_text "NoMethodError"
        assert_text "undefined method"
      end
    end
  end
end
