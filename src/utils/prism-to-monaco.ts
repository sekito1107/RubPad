import { MethodCall } from '../state/analysis';

/**
 * Prism (Ruby) の座標系を Monaco Editor 用の座標系に変換する単一のポイント変換。
 */
export const convertPrismPosition = (line: number, col: number) => {
  return {
    line: line,
    column: col + 1
  };
};

/**
 * Prism の解析結果を Monaco Editor 用および UI 表示用の形式に変換する。
 */
export const prismToMonaco = (items: any[]): MethodCall[] => {
  return items.map(item => {
    const pos = convertPrismPosition(item.line, item.col);
    return {
      name: item.name,
      line: pos.line,
      col: pos.column,
      info: item.info
    };
  });
};
