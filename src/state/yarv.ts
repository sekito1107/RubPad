import { proxy } from 'valtio';
import { Phase, DEFAULT_PHASE } from '../types/yarv';

export const yarv: { phase: Phase; version: string } = proxy({
  phase: DEFAULT_PHASE,
  version: '',
});

export const setPhase = (phase: Phase) => {
  yarv.phase = phase;
};

export const setVersion = (version: string) => {
  yarv.version = version;
};
