import { MethodCall } from '../state/analysis';

/**
 * Prism 形式の解析情報を Monaco Editor 用および UI 表示用の形式に変換する。
 */
export const prismToMonaco = (items: any[]): MethodCall[] => {
  return items.map(item => {
    let className: string | null = null;

    if (item.type_info) {
      // TypeProf の出力 ("Integer#+" or "Integer") からクラス名部分を抽出
      const rawClass = item.type_info.split('#')[0];
      
      // ジェネリクス部分 (例: Enumerator[int]) を除去
      const cleanClass = rawClass.replace(/\[.*\]$/, '');

      // "???" を含む不明な型情報は null として扱う
      if (cleanClass && !cleanClass.includes('???')) {
        className = cleanClass;
      }
    }

    return {
      name: item.name,
      line: item.line,
      col: item.col + 1, // Monaco Editor の 1-based 列番号に補正
      className: className
    };
  });
};
