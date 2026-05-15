import * as monaco from 'monaco-editor';
// @ts-ignore
import YarvServer from './ruby/yarv?worker';
import { lspToMonaco } from '../utils/lsp-to-monaco';
import { MethodCall, VariableDefinition } from '../state/analysis';
import { prismToMonaco, convertPrismPosition } from '../utils/prism-to-monaco';

const encode = (str: string) => btoa(unescape(encodeURIComponent(str)));


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
  return send(`require 'base64'; Executor.run(Base64.decode64('${encode(code)}').force_encoding('UTF-8'))`);
};

export const syncStdin = (input: string) => {
  send(`require 'base64'; Stdin.update(Base64.decode64('${encode(input)}').force_encoding('UTF-8'))`);
};

export const analyze = async (code: string): Promise<monaco.editor.IMarkerData[]> => {
  const raw = await send(`require 'base64'; Diagnostics.run(Base64.decode64('${encode(code)}').force_encoding('UTF-8'))`);
  return lspToMonaco(JSON.parse(raw));
};

export const scan = async (code: string): Promise<{ methods: MethodCall[], variables: VariableDefinition[], literals: VariableDefinition[] }> => {
  const raw = await send(`require 'base64'; Analyzer.run(Base64.decode64('${encode(code)}').force_encoding('UTF-8'))`);
  const { methods, variables, literals } = JSON.parse(raw);
  return {
    methods: prismToMonaco(methods),
    variables: variables.map((v: any) => {
      const pos = convertPrismPosition(v.line, v.col);
      return {
        name: v.name,
        line: pos.line,
        col: pos.column,
        type_info: v.type_info
      };
    }),
    literals: (literals || []).map((v: any) => {
      const pos = convertPrismPosition(v.line, v.col);
      return {
        name: v.name,
        line: pos.line,
        col: pos.column,
        type_info: v.type_info
      };
    })
  };
};

export const pick = async (code: string, line: number, col: number) => {
  const raw = await send(`require 'base64'; Picker.run(Base64.decode64('${encode(code)}').force_encoding('UTF-8'), ${line}, ${col})`);
  return JSON.parse(raw);
};

export const inspect = async (code: string, expression: string, line: number, kind: 'variable' | 'assignment' | 'expression' | 'block_variable', endLine: number, receiver: string | null = null, blockDepth: number | null = null, blockOrder: number | null = null, blockStartLine: number | null = null) => {
  const encodedCode = encode(code);
  const encodedExpr = encode(expression);
  const encodedReceiver = receiver ? `Base64.decode64('${encode(receiver)}').force_encoding('UTF-8')` : 'nil';
  const blockDepthArg = blockDepth !== null ? blockDepth : 'nil';
  const blockOrderArg = blockOrder !== null ? blockOrder : 'nil';
  const blockStartLineArg = blockStartLine !== null ? blockStartLine : 'nil';

  const raw = await send(`require 'base64'; Inspector.run(Base64.decode64('${encodedCode}').force_encoding('UTF-8'), Base64.decode64('${encodedExpr}').force_encoding('UTF-8'), ${line}, ${JSON.stringify(kind)}, ${endLine}, ${encodedReceiver}, ${blockDepthArg}, ${blockOrderArg}, ${blockStartLineArg})`);
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
