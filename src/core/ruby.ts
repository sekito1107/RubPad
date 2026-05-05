import * as monaco from 'monaco-editor';
// @ts-ignore
import YarvServer from './ruby/yarv?worker';
import { lspToMonaco } from '../utils/lsp-to-monaco';
import { MethodCall, VariableDefinition } from '../state/analysis';


const server = new YarvServer();
const queue: ((value: string) => void)[] = [];

server.onmessage = (event: MessageEvent) => {
  const resolve = queue.shift()!;
  resolve(event.data);
};

const send = (code: string): Promise<string> => {
  return new Promise((resolve) => {
    queue.push(resolve);
    server.postMessage(code);
  });
};

export const execute = (code: string): Promise<string> => {
  return send(`Executor.run(${JSON.stringify(code)})`);
};

export const analyze = async (code: string): Promise<monaco.editor.IMarkerData[]> => {
  const raw = await send(`Diagnostics.run(${JSON.stringify(code)})`);
  return lspToMonaco(JSON.parse(raw));
};

export const scan = async (code: string): Promise<{ methods: MethodCall[], variables: VariableDefinition[] }> => {
  const raw = await send(`Scanner.scan(${JSON.stringify(code)})`);
  return JSON.parse(raw);
};

export const initAnalyzer = () => {
  send('Diagnostics.init');
};

export const checkAnalyzerReady = async (): Promise<boolean> => {
  const result = await send(
    'defined?(Diagnostics) && Diagnostics.instance_variable_get(:@service) ? "ok" : "no"'
  );
  return result === 'ok';
};
