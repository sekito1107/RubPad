import * as monaco from 'monaco-editor';

/**
 * Monaco Editor の座標を Prism (Ruby) の座標系に変換する。
 * - 行: 1-based (変更なし)
 * - 列: 1-based -> 0-based に変換
 */
export const monacoToPrism = (position: monaco.IPosition) => {
  return {
    line: position.lineNumber,
    col: position.column - 1
  };
};
