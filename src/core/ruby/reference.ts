export const getReferenceUrl = (methodName: string, _className?: string): string => {
  const baseUrl = 'https://docs.ruby-lang.org/ja/latest/search/';
  return `${baseUrl}query:${encodeURIComponent(methodName)}/`;
};
