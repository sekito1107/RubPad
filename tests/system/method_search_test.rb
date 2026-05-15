require "test_helper"

class MethodSearchTest < SystemTest
  def test_クラスのメソッド一覧とインクリメンタルサーチが正しく機能すること
    visit "/"
    wait_wasm_loading
    wait_analyzer_ready

    assert_text "REFERENCE SEARCH"
    find("select").select("Array")
    assert_text "map"
    assert_text "find"
    find("input[placeholder='Search methods...']").fill_in(with: "find")
    assert_text "find"
    assert_no_text "map"
    assert_selector "a[href='https://docs.ruby-lang.org/ja/latest/method/Enumerable/i/find.html']"
  end
end
