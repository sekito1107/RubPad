require "test_helper"

class InitializationTest < SystemTest
  def test_起動時にステータスインジケーターが順次点灯すること
    visit "/"

    assert_selector "[data-testid='status-editor'][data-ready='true']"
    assert_selector "[data-testid='status-ruby'][data-ready='true']"
  end
end
