import pako from 'pako';

/**
 * コードをLZ77(Deflate)で圧縮し、URLセーフなBase64文字列に変換する
 * これにより長大なコードでも短いURLで共有可能になる
 * @param code エディタに入力された生コード
 * @returns 圧縮済みのURLセーフな文字列
 */
export const compressCode = (code: string): string => {
  // コードをUint8Arrayに圧縮
  const compressed = pako.deflate(code);
  let binary = '';
  const len = compressed.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(compressed[i]);
  }
  // Base64化し、URLで使用できない記号(+, /, =)を置換して安全にする
  const base64 = btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  return base64;
};

/**
 * URLセーフなBase64文字列を元の生コードに復元する
 * 共有URL経由でアクセスされた際にエディタの初期状態を復元するために使用
 * @param base64Safe 圧縮済みのURLセーフな文字列
 * @returns 復元された生のRubyコード（失敗した場合はnull）
 */
export const decompressCode = (base64Safe: string): string | null => {
  try {
    // URLセーフ化された文字(+, /, =)を元のBase64の記号に戻す
    let base64 = base64Safe.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    const binary = atob(base64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    // Uint8Arrayから文字列としてコードを解凍
    const decompressed = pako.inflate(bytes, { to: 'string' });
    return decompressed;
  } catch (e) {
    console.error("Failed to decompress code:", e);
    return null;
  }
};
