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

  def type_code(code)
    find(".monaco-editor").click
    send_keys([:control, "a"], :backspace)
    send_keys(code)
    wait_analyzer_ready
  end

  # 指定した行・列の位置をホバーする
  # Monaco の座標計算 API を利用し、正確な位置にマウスを移動させる
  def hover_monaco_position(line:, column:)
    # ブラウザ側で座標を取得
    coords = page.evaluate_script(<<~JS)
      (function() {
        const editor = window.editor;
        if (!editor) return null;
        
        // 指定位置の画面上の相対座標を取得
        const pos = { lineNumber: #{line}, column: #{column} };
        const scrolledPos = editor.getScrolledVisiblePosition(pos);
        if (!scrolledPos) return null;
        
        // エディタコンテナの絶対座標を取得して加算
        const rect = document.getElementById('monaco-editor').getBoundingClientRect();
        return {
          x: rect.left + scrolledPos.left,
          y: rect.top + scrolledPos.top
        };
      })()
    JS

    raise "Could not get Monaco coordinates for line #{line}, column #{column}" unless coords

    # Capybara でマウスを移動
    # offset は要素の左上からの相対位置として扱われることがあるため、
    # window 全体に対する絶対座標として移動させるために native ドライバの action を使用
    page.driver.browser.action.move_to_location(coords["x"].to_i, coords["y"].to_i).perform
  end

  def teardown
    Capybara.current_session.driver.quit
    super
  end
end
