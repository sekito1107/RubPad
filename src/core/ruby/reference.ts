import { MethodCall } from "../../state/analysis";

/**
 * Ruby のメソッド名をリファレンスサイト (docs.ruby-lang.org) 用の形式にエンコードする
 * 例: "[]" -> "=5b=5d", "!" -> "=21"
 */
const encodeRubyMethod = (name: string): string => {
  return name.replace(/[^\w]/g, (char) => {
    return '=' + char.charCodeAt(0).toString(16);
  });
};

export const getReferenceUrl = (method: MethodCall): string | null => {
  const { name, info } = method;

  if (!info.owner) {
    return null;
  }

  // 種別 (i, s, m) の判定
  let type = info.is_singleton_call ? 's' : 'i';

  // モジュールかつ、インスタンスとシングルトンの両方に定義がある場合は「モジュール関数(/m/)」
  if (info.owner_type === 'module') {
    if (info.has_instance && info.has_singleton) {
      type = 'm';
    } else if (info.is_singleton_call) {
      type = 's';
    } else {
      type = 'i';
    }
  }

  const encodedName = encodeRubyMethod(name);

  return `https://docs.ruby-lang.org/ja/latest/method/${info.owner}/${type}/${encodedName}.html`;
};
