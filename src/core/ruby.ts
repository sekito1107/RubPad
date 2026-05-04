// @ts-ignore
import YarvServer from './ruby/yarv?worker';

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

export const analyze = (code: string): Promise<string> => {
  return send(`Diagnostics.run(${JSON.stringify(code)})`);
};
