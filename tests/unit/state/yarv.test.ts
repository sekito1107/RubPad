import { describe, it, expect } from 'vitest';
import { yarv, setPhase, setVersion } from '../../../src/state/yarv';
import { DEFAULT_PHASE } from '../../../src/types/yarv';

describe.sequential('state/yarv', () => {
  it('初期状態が正しいこと', () => {
    expect(yarv.phase).toBe(DEFAULT_PHASE);
    expect(yarv.version).toBe('');
  });

  it('setPhase で phase が更新されること', () => {
    setPhase('ready');
    expect(yarv.phase).toBe('ready');
  });

  it('setVersion で version が更新されること', () => {
    setVersion('4.0.0');
    expect(yarv.version).toBe('4.0.0');
  });
});
