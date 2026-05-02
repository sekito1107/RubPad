import { proxy } from 'valtio';
import { Phase, DEFAULT_PHASE } from '../types/yarv';

export const yarv: { phase: Phase } = proxy({
  phase: DEFAULT_PHASE,
});

export const setPhase = (phase: Phase) => {
  yarv.phase = phase;
};
