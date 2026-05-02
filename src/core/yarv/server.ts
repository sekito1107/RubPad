import { DefaultRubyVM } from '@ruby/wasm-wasi/dist/browser';
// @ts-ignore
import initRubyWasm from '../../../public/ruby/rubox.wasm?init';

type RubyVM = Awaited<ReturnType<typeof DefaultRubyVM>>['vm'];

(async () => {
  try {
    const module = await initRubyWasm();
    const { vm } = await DefaultRubyVM(module);
    vm.eval('require "js"');

    postMessage({ type: 'ready' });

    self.onmessage = (event) => handleRequest(vm, event);
  } catch (e) {
    const payload = e instanceof Error ? e.message : String(e);
    postMessage({ type: 'error', payload: `Failed to initialize Ruby VM: ${payload}` });
  }
})();

function handleRequest(vm: RubyVM, event: MessageEvent) {
  const { code } = event.data;

  try {
    (self as any)._tmpCode = code;

    // StringIOで$stdoutを上書きして実行結果を回収する
    const result = vm.eval(`
      require "stringio"
      $stdout = StringIO.new
      eval(JS.global[:_tmpCode].to_s)
      $stdout.string
    `);

    postMessage({ type: 'output', payload: result.toString() });
  } catch (e) {
    const payload = e instanceof Error ? e.message : String(e);
    postMessage({ type: 'error', payload });
  } finally {
    (self as any)._tmpCode = null;
  }
}
