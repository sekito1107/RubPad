require 'minitest/autorun'
require 'json'
require_relative '../../../src/core/ruby/scanner'

class ScannerTest < Minitest::Test
  def test_メソッド呼び出しが正しく抽出されること
    code = "puts 'hello'"
    result = scan(code)
    
    assert_equal 1, result["methods"].size
    assert_equal "puts", result["methods"][0]["name"]
    assert_equal 1, result["methods"][0]["line"]
  end

  def test_ローカル変数の代入が正しく抽出されること
    code = "x = 10"
    result = scan(code)
    
    assert_equal 1, result["variables"].size
    assert_equal "x", result["variables"][0]["name"]
    assert_equal 0, result["variables"][0]["col"]
  end

  def test_ブロック引数のショートハンドが抽出されること
    code = "map(&:to_s)"
    result = scan(code)
    
    names = result["methods"].map { |m| m["name"] }
    assert_includes names, "map"
    assert_includes names, "to_s"
  end

  def test_複数行の座標が正しいこと
    code = <<~RUBY
      x = 1
      puts x
    RUBY
    result = scan(code)
    
    assert_equal 1, result["variables"][0]["line"]
    assert_equal 2, result["methods"][0]["line"]
  end

  def test_空文字でエラーにならないこと
    result = scan("")
    assert_empty result["methods"]
    assert_empty result["variables"]
  end

  private

  def scan(code)
    JSON.parse(Scanner.scan(code))
  end
end
