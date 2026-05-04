$LOADED_FEATURES << "socket" << "io/console"

require "js"
require "pathname"
require "rbs"
require "typeprof"
require "typeprof/lsp"
require "json"

module Analyzer
  def self.init
    # RBSを仮想ファイルシステムに書き込む
    response = JS.global.fetch("/rbs/ruby-stdlib.rbs").await
    rbs_data = response.text().await
    File.write("/stdlib.rbs", rbs_data.to_s)

    # RBSを利用してTypeProfを初期化
    loader = RBS::EnvironmentLoader.new(core_root: nil)
    loader.add(path: Pathname.new("/stdlib.rbs"))
    @service = TypeProf::Core::Service.new(rbs_env: RBS::Environment.from_loader(loader))
  end

  def self.run(code)
    # TODO
  end
end
