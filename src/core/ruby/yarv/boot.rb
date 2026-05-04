require "js"
require "stringio"
require "rubygems"


begin
  require "typeprof"
  require "typeprof/lsp"
  puts "Rubox: TypeProf & LSP loaded successfully."
rescue LoadError => e
  warn "Rubox Warning: TypeProf or LSP could not be loaded. Analysis features will be disabled. (#{e.message})"
end
