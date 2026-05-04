$LOADED_FEATURES << "socket" << "io/console"

require "js"
require "stringio"
require "rubygems"
require "pathname"
require "rbs"
require "typeprof"
require "typeprof/lsp"

loader = RBS::EnvironmentLoader.new(core_root: nil)
loader.add(path: Pathname.new("/stdlib.rbs"))

module Rubox
  RBS_ENV = RBS::Environment.from_loader(loader)
end
