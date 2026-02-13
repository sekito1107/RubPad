require "js"
require "rubygems"

# 環境パッチを最優先
require "env"

require "typeprof"
require "typeprof/lsp"

require "workspace"
require "measure_value"
require "server"

# TypeProfコアの初期化
rbs_list = File.exist?("/workspace/stdlib.rbs") ? ["/workspace/stdlib.rbs"] : []
core = TypeProf::Core::Service.new(rbs_files: rbs_list)

# ウォームアップ
begin
  iseq_klass = defined?(TypeProf::Core::ISeq) ? TypeProf::Core::ISeq : (defined?(TypeProf::ISeq) ? TypeProf::ISeq : nil)
  if iseq_klass
    iseq_klass.compile("Array.new; 'str'.upcase; {a: 1}.keys").each { |iseq| core.add_iseq(iseq) }
  end
rescue
end

$server = Server.new(core)
$server.start
