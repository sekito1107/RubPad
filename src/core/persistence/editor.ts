const CODE_KEY = 'rubox_code';

export const saveCode = (code: string): void => {
  localStorage.setItem(CODE_KEY, code);
};

export const loadCode = (): string | null => {
  return localStorage.getItem(CODE_KEY);
};
