require "test_helper"

class CodePersistenceTest < SystemTest
  def test_入力したコードがリロード後も維持されること
    visit "/"

    find(".monaco-editor").click
    send_keys([:control, "a"], :backspace)
    send_keys("puts 'Persistence Check'")

    visit "/"

    assert_selector ".monaco-editor", text: "Persistence Check"
  end
end
