require_relative "../test_helper"

class InlayHintsTest < SystemTest
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

  def test_変数代入時の遷移表示
    type_code("a = 1")
    find(".monaco-editor .view-line", text: "a").find("span", text: "a", exact_text: true).hover
    find("[data-testid='pin-button']").click
    assert_text "a: nil -> 1"
  end

  def test_メソッド呼び出し時の遷移表示
    type_code("a = 'hi'\na.upcase")
    find(".monaco-editor .view-line", text: "upcase").find("span", text: "upcase", exact_text: true).hover
    find("[data-testid='pin-button']").click
    assert_text "a.upcase: \"hi\" -> \"HI\""
  end

  def test_破壊的メソッドでの副作用回避
    type_code("a = []\na << 1")
    find(".monaco-editor .view-line", text: "<<").find("span", text: "<<", match: :first).hover
    find("[data-testid='pin-button']").click
    assert_text "a << 1: [] -> [1]"
  end

  def test_破壊的メソッド呼び出し行での変数参照
    type_code("a = [1, 2]\nb = a.pop")
    find(".monaco-editor .view-line", text: "a.pop").find("span", text: "a", match: :first).hover
    find("[data-testid='pin-button']").click
    assert_text "a: [1, 2]"
  end

  def test_破壊的メソッド呼び出し行での代入先
    type_code("a = [1, 2]\nb = a.pop")
    find(".monaco-editor .view-line", text: "b = a.pop").find("span", text: "b", exact_text: true).hover
    find("[data-testid='pin-button']").click
    assert_text "b: nil -> 2"
  end

  def test_長い変数名の省略表示
    type_code("a_very_long_variable_name = 1")
    find(".monaco-editor .view-line", text: "a_very_long_variable_name").find("span", text: "a_very_long_variable_name", exact_text: true).hover
    find("[data-testid='pin-button']").click
    assert_text "a_very_long_...: nil -> 1"
  end

  def test_メソッドチェーンの中間状態の表示
    type_code("a = 'hi'\na.upcase.reverse")
    find(".monaco-editor .view-line", text: "a.upcase.reverse").find("span", text: "upcase", exact_text: true).hover
    find("[data-testid='pin-button']").click
    assert_text "a.upcase: \"hi\" -> \"HI\""
  end

  def test_同一行内での複数変数のインスペクト_左側の変数
    type_code("a = 1; b = 2")
    find("span", text: "a", exact_text: true).hover
    find("[data-testid='pin-button']").click
    assert_text "a: nil -> 1"
  end

  def test_同一行内での複数変数のインスペクト_右側の変数
    type_code("a = 1; b = 2")
    find("span", text: "; b = ", exact_text: true).hover
    find("[data-testid='pin-button']").click
    assert_text "b: nil -> 2"
  end

  def test_ブロック引数のシャドウイング
    type_code("a = 0\n[1].each { |a| a }")
    find(".monaco-editor .view-line", text: "[1].each").all("span", text: "a").last.hover
    find("[data-testid='pin-button']").click
    assert_text "a: 1"
  end

  def test_編集によるヒントの消去
    type_code("a = 1")
    find(".monaco-editor .view-line", text: "a = 1").find("span", text: "a", exact_text: true).hover
    find("[data-testid='pin-button']").click
    assert_text "a: nil -> 1"
    
    find(".monaco-editor .view-line", text: "a = 1").click
    send_keys(:escape)
    send_keys(:end, :backspace, "2")
    refute_text "a: nil -> 1"
  end

  def test_他行の編集によるヒントの維持
    type_code("a = 1\n")
    find(".monaco-editor .view-line", text: "a = 1").find("span", text: "a", exact_text: true).hover
    find("[data-testid='pin-button']").click
    assert_text "a: nil -> 1"
    
    find(".monaco-editor").click
    send_keys(:down, "# comment")
    assert_text "a: nil -> 1"
  end
end
