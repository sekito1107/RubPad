require "test_helper"

class ShareTest < SystemTest
  def test_シェアモーダルの表示と各シェアオプションの生成が機能すること
    visit "/"
    wait_wasm_loading

    find(".monaco-editor").click
    send_keys([:control, "a"], :backspace)
    send_keys("puts 'Share test'", :enter)

    click_button "Share"

    assert_text "Share Code"
    assert_text "URL"
    assert_text "Iframe"
    assert_text "Markdown"

    url_value = find("#share-url-input").value
    assert_match(/#code=/, url_value)
    
    iframe_value = find("#share-iframe-input").value
    assert_match(/<iframe src=/, iframe_value)
    assert_match(/#code=/, iframe_value)

    markdown_content = find("#share-markdown-textarea").value
    assert_match(/```ruby/, markdown_content)
    assert_match(/puts 'Share test'/, markdown_content)
    assert_match(/```/, markdown_content)

    find("#close-share-modal").click
    assert_no_text "Share Code"
  end

  def test_URLのハッシュからコードが復元されること
    compressed_code = "eJwrKC0pVlDySM3JyddRCM5ILEpNUQjPL8pJUVQCAINLCRE"
    visit "/#code=#{compressed_code}"
    
    wait_wasm_loading

    within ".monaco-editor" do
      assert_text "puts \"Hello, Shared World!\""
    end
  end
end
