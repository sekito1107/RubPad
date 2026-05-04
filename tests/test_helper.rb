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
Capybara.default_max_wait_time = 5

class SystemTest < Minitest::Test
  include Capybara::DSL
  include Capybara::Minitest::Assertions

  # Ruby (WASM) の初期化完了を待機
  def wait_wasm_loading
    find("[data-testid='status-runtime'][data-ready='true']", wait: 30)
  end

  # 解析エンジン (RBS) の初期化完了を待機
  def wait_analyzer_ready
    find("[data-testid='status-analyzer'][data-ready='true']", wait: 30)
  end

  def teardown
    Capybara.current_session.driver.quit
    super
  end
end
