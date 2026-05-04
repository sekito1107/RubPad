require "test_helper"

class InitializationTest < SystemTest
  def test_起動時に3段階のステータスインジケーターが順次点灯すること
    visit "/"

    assert_selector "[data-testid='status-editor'][data-ready='true']"
    assert_selector "[data-testid='status-runtime'][data-ready='true']"
    assert_selector "[data-testid='status-analyzer'][data-ready='true']"
  end
end
