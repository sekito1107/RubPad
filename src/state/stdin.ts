import { proxy } from 'valtio';

export interface StdinState {
  slots: [string, string, string];
  activeSlot: number;
}

export const stdinState = proxy<StdinState>({
  slots: ['', '', ''],
  activeSlot: 0,
});

export const setStdin = (index: number, input: string) => {
  stdinState.slots[index] = input;
};

export const setActiveSlot = (index: number) => {
  stdinState.activeSlot = index;
};
