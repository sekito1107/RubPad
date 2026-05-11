require "minitest/autorun"
require "capybara/minitest"
require "rack"
require "selenium-webdriver"

Capybara.app = Rack::Static.new(
  lambda { [404, {}, []] },
  urls: [""],
  root: "dist",
  index: "index.html"
)

Capybara.register_driver :selenium_chrome_headless do |app|
  options = Selenium::WebDriver::Chrome::Options.new
  options.add_argument('--headless')
  options.add_argument('--no-sandbox')
  options.add_argument('--disable-dev-shm-usage')
  options.add_argument('--window-size=1400,1400')
  Capybara::Selenium::Driver.new(app, browser: :chrome, options: options)
end

Capybara.default_driver = :selenium_chrome_headless
Capybara.default_max_wait_time = 5

class SystemTest < Minitest::Test
  include Capybara::DSL
  include Capybara::Minitest::Assertions

  # Ruby の初期化完了を待機
  def wait_wasm_loading
    find("[data-testid='status-ruby'][data-ready='true']", wait: 30)
  end

  # 解析エンジンの初期化完了を待機
  def wait_analyzer_ready
    find("[data-testid='status-ruby'][data-ready='true']", wait: 30)
  end

  def teardown
    Capybara.current_session.driver.quit
    super
  end
end
