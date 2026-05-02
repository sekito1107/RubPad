import { DefaultRubyVM } from '@ruby/wasm-wasi/dist/browser';
type RubyVM = Awaited<ReturnType<typeof DefaultRubyVM>>['vm'];

const vmPromise = (async () => {
  const response = await fetch('/ruby/rubox.wasm');
  const module = await WebAssembly.compileStreaming(response);
  const { vm } = await DefaultRubyVM(module);
  vm.eval('require "js"');
  return vm;
})();

self.onmessage = async event => {
  const vm = await vmPromise;
  handleRequest(vm, event);
};

function handleRequest(vm: RubyVM, event: MessageEvent) {
  const code = event.data;
  const escapedCode = JSON.stringify(code);

  const result = vm.eval(`
    require "stringio"
    $stdout = StringIO.new
    begin
      eval(${escapedCode})
    rescue Exception => e
      puts e.full_message
    end
    $stdout.string
  `);

  postMessage(result.toString());
}
