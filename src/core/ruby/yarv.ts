import { DefaultRubyVM } from '@ruby/wasm-wasi/dist/browser';

// @ts-ignore
import boot from './yarv/boot.rb?raw';
// @ts-ignore
import executor from './yarv/executor.rb?raw';

const scripts = [executor, boot];

const vmPromise = (async () => {
  const response = await fetch('/ruby/rubox.wasm');
  const module = await WebAssembly.compileStreaming(response);
  const { vm } = await DefaultRubyVM(module);
  
  scripts.forEach(code => {
    vm.eval(code);
  });
  
  return vm;
})();

self.onmessage = async event => {
  const vm = await vmPromise;
  const result = vm.eval(`Rubox.run(${JSON.stringify(event.data)})`);
  postMessage(result.toString());
};
