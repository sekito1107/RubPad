import * as monaco from 'monaco-editor';
// @ts-ignore
import YarvServer from './ruby/yarv?worker';
import { lspToMonaco } from '../utils/lsp-to-monaco';
import { MethodCall, VariableDefinition } from '../state/analysis';
import { prismToMonaco } from '../utils/prism-to-monaco';


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
  const raw = await send(`Analyzer.run(${JSON.stringify(code)})`);
  const { methods, variables } = JSON.parse(raw);
  return {
    methods: prismToMonaco(methods),
    variables: prismToMonaco(variables)
  };
};

export const pick = async (code: string, line: number, col: number) => {
  const raw = await send(`Picker.run(${JSON.stringify(code)}, ${line}, ${col})`);
  return JSON.parse(raw);
};

export const inspect = async (code: string, expression: string, line: number, kind: 'variable' | 'assignment' | 'expression', endLine: number) => {
  const raw = await send(`Inspector.run(${JSON.stringify(code)}, ${JSON.stringify(expression)}, ${line}, ${JSON.stringify(kind)}, ${endLine})`);
  return JSON.parse(raw);
};

export const initAnalyzer = () => {
  send('TypeProfEngine.init');
};

export const checkAnalyzerReady = async (): Promise<boolean> => {
  const result = await send(
    'defined?(TypeProfEngine) && TypeProfEngine.service ? "ok" : "no"'
  );
  return result === 'ok';
};
