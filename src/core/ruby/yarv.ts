import { DefaultRubyVM } from '@ruby/wasm-wasi/dist/browser';

// @ts-expect-error: raw import
import executor from './executor.rb?raw';
// @ts-expect-error: raw import
import stdin from './stdin.rb?raw';
// @ts-expect-error: raw import
import typeprof from './typeprof.rb?raw';
// @ts-expect-error: raw import
import diagnostics from './typeprof/diagnostics.rb?raw';
// @ts-expect-error: raw import
import analyzer from './typeprof/analyzer.rb?raw';
// @ts-expect-error: raw import
import selector from './picker/selector.rb?raw';
// @ts-expect-error: raw import
import picker from './picker.rb?raw';
// @ts-expect-error: raw import
import environment from './inspector/environment.rb?raw';
// @ts-expect-error: raw import
import inspector from './inspector.rb?raw';
// @ts-expect-error: raw import
import methodSearcher from './method_searcher.rb?raw';
// @ts-expect-error: raw import
import liveEvaluator from './live_evaluator.rb?raw';

const scripts = [stdin, executor, typeprof, diagnostics, analyzer, selector, picker, environment, inspector, methodSearcher, liveEvaluator];

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
  try {
    const vm = await vmPromise;
    const result = vm.eval(event.data);
    postMessage(result.toString());
  } catch (e) {
    console.error("Worker evaluation error:", e);
    postMessage(JSON.stringify({ status: "error", error_class: "WorkerError", error_message: String(e) }));
  }
};
