// @ts-ignore
import YarvServer from './ruby/yarv?worker';

const server = new YarvServer();

let returnResult: (value: string) => void;

server.onmessage = (event: MessageEvent) => {
  const payload = event.data;
  if (returnResult) {
    returnResult(payload);
  }
};

export const execute = (code: string): Promise<string> => {
  return new Promise((resolve) => {
    returnResult = resolve;
    server.postMessage(`Executor.run(${JSON.stringify(code)})`);
  });
};

export const analyze = (code: string): Promise<string> => {
  return new Promise((resolve) => {
    returnResult = resolve;
    server.postMessage(`Analyzer.run(${JSON.stringify(code)})`);
  });
};
