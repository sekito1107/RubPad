$LOADED_FEATURES << "socket" << "io/console"

require "js"
require "pathname"
require "rubygems"
require "rbs"
require "typeprof"
require "typeprof/lsp"
require "json"

module Diagnostics
  def self.init
    return if @service || @initializing
    @initializing = true

    JS.global.fetch("/rbs/ruby-stdlib.rbs")
      .then { |res| res.text }
      .then do |rbs_data|
        File.write("/stdlib.rbs", rbs_data.to_s)

        loader = RBS::EnvironmentLoader.new(core_root: nil)
        loader.add(path: Pathname.new("/stdlib.rbs"))
        @service = TypeProf::Core::Service.new(rbs_env: RBS::Environment.from_loader(loader))

        @initializing = false
      end
  end

  def self.run(code)
    init unless @service
    return "[]" unless @service
    "[]"
  end
end
