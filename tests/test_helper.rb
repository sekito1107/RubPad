require "minitest/autorun"
require "capybara/minitest"
require "rack"

Capybara.app = Rack::Static.new(
  lambda { [404, {}, []] },
  urls: [""],
  root: "dist",
  index: "index.html"
)

Capybara.default_driver = :selenium_chrome_headless

class SystemTest < Minitest::Test
  include Capybara::DSL
  include Capybara::Minitest::Assertions

  def teardown
    Capybara.current_session.driver.quit
    super
  end
end
