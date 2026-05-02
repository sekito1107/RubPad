import { DefaultRubyVM } from '@ruby/wasm-wasi/dist/browser';
// @ts-ignore
import initRubyWasm from '../../../public/ruby/rubox.wasm?init';

export const boot = async () => {
  const module = await initRubyWasm();
  const { vm } = await DefaultRubyVM(module);
  vm.eval('require "js"');
  return vm;
};
