import { setPhase } from '../state/yarv';
// @ts-ignore
import YarvServer from './yarv/server?worker';

const server = new YarvServer();
setPhase('loading');

server.onmessage = event => {
  const { type, payload } = event.data;

  switch (type) {
    case 'ready':
      setPhase('ready');
      break;
    case 'output':
      setPhase('ready');
      // 実行結果をターミナル等の出力先へ流す
      console.log(payload);
      break;
  }
};

/**
 * Ruby コードを実行します。
 * サーバーの状態（nullかどうか等）を呼び出し側が気にする必要はありません。
 */
export const execute = code => {
  setPhase('running');
  server.postMessage({ code });
};
