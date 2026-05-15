require "test_helper"

class MethodLinksTest < SystemTest
  def test_公式メソッドとユーザー定義メソッドが正しくセクション分けされリンクが機能すること
    visit "/"
    wait_wasm_loading
    wait_analyzer_ready

    # エディタにコードを入力
    # puts (Official), my_method (User), a (User/Unresolved)
    find(".monaco-editor").click
    send_keys([:control, "a"], :backspace)
    send_keys("puts 'hello'", :enter)
    send_keys("def my_method; end", :enter)
    send_keys("my_method", :enter)
    send_keys("a")

    # 解析とUI反映を待機 (OFFICIAL セクションヘッダーが表示されるまで)
    find("h3", text: "OFFICIAL")

    # Official セクションの確認
    # puts (Kernel#puts) が /m/ リンクとして存在することを確認
    assert_selector "a[href='https://docs.ruby-lang.org/ja/latest/method/Kernel/m/puts.html']", text: "puts"

    # User Defined セクションの確認
    assert_text "USER DEFINED"
    assert_text "my_method"
    assert_text "a"
    
    # ユーザー定義メソッドは a タグ（リンク）になっていないことを確認
    assert_no_selector "a", text: "my_method"
    assert_no_selector "a", text: "a"
  end
end
