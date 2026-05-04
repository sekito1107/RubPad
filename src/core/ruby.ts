// @ts-ignore
import YarvServer from './yarv/server?worker';

const server = new YarvServer();

let returnResult: (value: string) => void;

server.onmessage = (event: MessageEvent) => {
  const payload = event.data;
  if (returnResult) {
    returnResult(payload);
  }
};

export const run = (code: string): Promise<string> => {
  return new Promise((resolve) => {
    returnResult = resolve;
    server.postMessage(code);
  });
};
