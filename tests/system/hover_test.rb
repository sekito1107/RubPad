require_relative "../test_helper"

class HoverTest < SystemTest
  def setup
    visit "/"
    wait_wasm_loading
  end

  def type_code(code)
    find(".monaco-editor").click
    send_keys([:control, "a"], :backspace)
    send_keys(code)
    wait_analyzer_ready
  end

  def test_ホバーでの値の履歴表示_描画しきれるケース
    type_code("[1, 2].each { |n| n }")
    find(".monaco-editor .view-line", text: "n }").all("span", text: "n").last.hover
    within("[data-testid='hover-widget']") do
      assert_equal "n", find("[data-testid='expression']").text
      assert_text "Type: Integer"
      assert_equal "1, 2", find("[data-testid='runtime-value']").text
    end
  end

  def test_ホバーでの値の履歴表示_長すぎて省略されるケース
    type_code("(1..10).each { |n| n }")
    find(".monaco-editor .view-line", text: "n }").all("span", text: "n").last.hover
    within("[data-testid='hover-widget']") do
      value_text = find("[data-testid='runtime-value']").text
      assert value_text.length <= 20
      assert value_text.end_with?("...")
      assert value_text.start_with?("1, 2, 3, 4")
    end
  end

  def test_多重スコープとシャドウイングの解析
    type_code("x = 10\n[1, 2].each { |x| x }")
    find(".monaco-editor .view-line", text: "{ |x| x }").all("span", text: "x").last.hover
    within("[data-testid='hover-widget']") do
      assert_equal "x", find("[data-testid='expression']").text
      assert_equal "1, 2", find("[data-testid='runtime-value']").text
    end
  end

  def test_メソッドチェーンと戻り値の推移
    type_code("['a'].map(&:upcase).join")
    find(".monaco-editor .view-line", text: "join").find("span", text: "join", exact_text: true).hover
    within("[data-testid='hover-widget']") do
      assert_text "Receiver: ['a'].map(&:upcase)"
      assert_includes find("[data-testid='expression']").text, "join"
      assert_equal "\"A\"", find("[data-testid='runtime-value']").text
    end
  end

  def test_型変化と代入の追跡
    type_code("val = 123\nval = 'converted'")

    find(".monaco-editor .view-line", text: "val = 123").find("span", text: "val", exact_text: true).hover
    assert_text "Type: Integer"
    assert_text "123"

    # 重なり回避
    find("body").hover

    find(".monaco-editor .view-line", text: "val = 'converted'").find("span", text: "val", exact_text: true).hover
    assert_text "Type: String"
    assert_text "\"converted\""
  end

  def test_公式リファレンスリンクの表示
    type_code("puts 'test'")
    find(".monaco-editor .view-line", text: "puts 'test'").find("span", text: "puts", exact_text: true).hover
    within("[data-testid='hover-widget']") do
      assert_text "Kernel#puts docs.ruby-lang.org ↗"
      assert_selector "a[href*='docs.ruby-lang.org']"
    end
  end

  def test_特異メソッドのレシーバ表示
    type_code("class Foo; def self.bar; end; end\nFoo.bar")
    find(".monaco-editor .view-line", text: "Foo.bar").find("span", text: "bar", exact_text: true).hover
    within("[data-testid='hover-widget']") do
      assert_text "Receiver: Foo"
      assert_includes find("[data-testid='expression']").text, "bar"
    end
  end

  def test_未評価ノードとNone状態のハンドリング
    type_code("unexecuted = 1 if false\nnil_val = nil")
    find(".monaco-editor .view-line", text: "unexecuted").find("span", text: "unexecuted", exact_text: true).hover
    find("[data-testid='hover-widget']")
    within("[data-testid='hover-widget']") do
      assert_equal "(not executed)", find("[data-testid='runtime-value']").text
      refute find("[data-testid='pin-button']").disabled?
    end
  end

  def test_変数の多重代入
    # 同一行の記号がないコードは仕様上一つの要素として出力されるので、インスタンス変数として検証することでテストコードの簡略性を確保している
    type_code("@firstvar, @secondvar = [1, 2]")

    line = find(".monaco-editor .view-line", text: "@firstvar")
    
    line.find("span", text: "firstvar", exact_text: true).hover
    assert_selector("[data-testid='hover-widget']", text: "1")

    line.find("span", text: "secondvar", exact_text: true).hover
    assert_selector("[data-testid='hover-widget']", text: "2")
  end
end
