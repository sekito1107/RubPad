import { MethodCall } from '../state/analysis';

/**
 * Prism の解析結果を Monaco Editor 用および UI 表示用の形式に変換する。
 */
export const prismToMonaco = (items: any[]): MethodCall[] => {
  return items.map(item => {
    return {
      name: item.name,
      line: item.line,
      col: item.col + 1, // Monaco Editor の 1-based 列番号に補正
      info: item.info
    };
  });
};
