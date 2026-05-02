import { DefaultRubyVM } from '@ruby/wasm-wasi/dist/browser';
// @ts-ignore
import initRubyWasm from '../../../public/ruby/rubox.wasm?init';

type RubyVM = Awaited<ReturnType<typeof DefaultRubyVM>>['vm'];

const module = await initRubyWasm();
const { vm } = await DefaultRubyVM(module);
vm.eval('require "js"');

postMessage({ type: 'ready' });

self.onmessage = event => handleRequest(vm, event);

function handleRequest(vm: RubyVM, event: MessageEvent) {
  const { code } = event.data;
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

  postMessage({ type: 'output', payload: result.toString() });
}
