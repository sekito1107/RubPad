import { DefaultRubyVM } from '@ruby/wasm-wasi/dist/browser';

// @ts-ignore
import executor from './executor.rb?raw';
// @ts-ignore
import typeprof from './typeprof.rb?raw';
// @ts-ignore
import diagnostics from './typeprof/diagnostics.rb?raw';
// @ts-ignore
import analyzer from './typeprof/analyzer.rb?raw';
// @ts-ignore
import selector from './picker/selector.rb?raw';
// @ts-ignore
import picker from './picker.rb?raw';

const scripts = [executor, typeprof, diagnostics, analyzer, selector, picker];

const vmPromise = (async () => {
  const response = await fetch('/ruby/rubox.wasm');
  const module = await WebAssembly.compileStreaming(response);
  const { vm } = await DefaultRubyVM(module);

  vm.eval('require "js"');

  scripts.forEach(code => {
    vm.eval(code);
  });

  return vm;
})();

self.onmessage = async event => {
  const vm = await vmPromise;
  const result = vm.eval(event.data);
  postMessage(result.toString());
};
