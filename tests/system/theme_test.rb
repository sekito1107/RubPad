require "test_helper"

class ThemeTest < SystemTest
  def test_テーマの切り替えと永続化が動作すること
    visit "/"

    assert_selector "#app-container.dark"
    assert_selector ".monaco-editor.vs-dark"

    click_on "theme-toggle-button"
    assert_selector "#app-container:not(.dark)"
    assert_selector ".monaco-editor.vs"

    visit "/"
    assert_selector "#app-container:not(.dark)"
    assert_selector ".monaco-editor.vs"

    click_on "theme-toggle-button"
    assert_selector "#app-container.dark"
    assert_selector ".monaco-editor.vs-dark"
  end
end
