import { DefaultRubyVM } from '@ruby/wasm-wasi/dist/browser';

// @ts-ignore
import executor from './executor.rb?raw';
// @ts-ignore
import analyzer from './analyzer.rb?raw';

const scripts = [executor, analyzer];

const vmPromise = (async () => {
  const response = await fetch('/ruby/rubox.wasm');
  const module = await WebAssembly.compileStreaming(response);
  const { vm } = await DefaultRubyVM(module);
  
  // 基盤の初期化
  vm.eval('require "js"');

  // 自律型コンポーネントのロード
  scripts.forEach(code => {
    vm.eval(code);
  });
  
  return vm;
})();

self.onmessage = async event => {
  const vm = await vmPromise;
  // 届いた実行用コード（Executor.run(...) など）をそのまま評価
  const result = vm.eval(event.data);
  postMessage(result.toString());
};
