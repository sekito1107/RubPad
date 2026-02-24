
require 'minitest/autorun'
require 'stringio'
require_relative '../../../src/ruby/measure_value'

class RuboxStopExecution < StandardError; end

class TestMeasureValue < Minitest::Test
  def test_未来の値のキャプチャが防止されていること
    code = <<~RUBY
      string = "Ruby"
      5.times do 
        string << "!"
      end
      string = "reset"
    RUBY
    result = MeasureValue.run("string", 1, binding, "", code)
    assert_equal '"Ruby"', result, "1行目では初期値のみがキャプチャされるべきです"
  end

  def test_getsの実行結果が正しく取得できること
    code = "x = gets"
    result = MeasureValue.run("x", 1, binding, "hello\n", code)
    assert_match /"hello\\n"/, result, "gets の戻り値がキャプチャされるべきです"
  end

  def test_ループ内での値の変化が正しく取得できること
    code = <<~RUBY
      a = 0
      3.times do |i|
        a += 1
      end
    RUBY
    result = MeasureValue.run("a", 3, binding, "", code)
    assert_equal '1, 2, 3', result, "ループ中の各ステップの値がキャプチャされるべきです"
  end

  def test_再代入時に新しい値のみが表示されること
    code = <<~RUBY
      string = "Ruby"

      5.times do 
        string << "!"
      end

      puts string

      string = "reset"

      puts string
    RUBY
    result = MeasureValue.run("string", 9, binding, "", code)
    assert_equal '"reset"', result, "再代入行では古い値を含まず、新しい値のみが表示されるべきです"
  end

  def test_putsの箇所で未来の代入値が混入しないこと
    code = <<~RUBY
      string = "Ruby"

      5.times do 
        string << "!"
      end

      puts string

      string = "reset"

      puts string
    RUBY
    result = MeasureValue.run("string", 7, binding, "", code)
    assert_equal '"Ruby!!!!!"', result, "puts行ではその時点の値のみが表示されるべきであり、後の'reset'は含まれないべきです"
  end

  def test_ブロックを伴う代入文で中間値nilがキャプチャされないこと
    code = <<~RUBY
      _x = gets.chomp
      targets = readlines(chomp: true)
      max_length = targets.max_by{|t| t.size}.size
    RUBY
    stdin = <<~INPUT
      4
      apple
      blueberry
      coconut
      dragonfruit
    INPUT
    result = MeasureValue.run("max_length", 3, binding, stdin, code)
    assert_equal '11', result, "ブロックを伴う代入文で、代入前のnilがキャプチャされるべきではありません"
  end

  def test_メソッドチェーンの結果が正しく取得できること
    code = <<~RUBY
      target = "banana"
      target.each_char
    RUBY
    result = MeasureValue.run("target.each_char", 2, binding, "", code)
    assert_match /#<Enumerator: "banana":each_char>/, result, "メソッドチェーンの戻り値がキャプチャされるべきです"
  end

  def test_def内からトップレベル変数が参照されないこと
    code = <<~RUBY
      target = "banana"
      def my_count
        target = "apple"
        target
      end
      my_count
    RUBY
    result = MeasureValue.run("target", 4, binding, "", code)
    assert_equal '"apple"', result
  end

  def test_トップレベル変数がdef内の同名変数に上書きされないこと
    code = <<~RUBY
      target = "banana"
      def my_count(target)
        target
      end
      my_count("apple")
    RUBY
    result = MeasureValue.run("target", 1, binding, "", code)
    assert_equal '"banana"', result, "1行目ではトップレベル変数の値のみが表示されるべきです"
  end

  def test_メソッド内のローカル変数が正しく取得できること
    code = <<~RUBY
      def my_method
        x = 10
        x
      end
      my_method
    RUBY
    result = MeasureValue.run("x", 3, binding, "", code)
    assert_equal '10', result, "メソッド内のローカル変数は取得できるべきです"
  end

  def test_ループ内のブロック呼び出しを伴う行で最終的な値が取得できること
    code = <<~RUBY
      a = []
      3.times do |i|
        a << [1].map { |n| n }
      end
    RUBY
    result = MeasureValue.run("a", 3, binding, "", code)
    # "[1], [1], [1]" が最終的な配列の状態として含まれていることを確認
    assert_includes result, "[[1], [1], [1]]", "ループの最終周回において、ブロック実行後の最終的な状態がキャプチャされるべきです"
  end

  def test_同一行内でのループにおけるキャプチャ
    code = "a = []; 3.times { a << 1 }"
    result = MeasureValue.run("a", 1, binding, "", code)
    assert_includes result, "[1, 1, 1]", "単一行のループ内でも、最終的な状態がキャプチャされるべきです"
  end
end
