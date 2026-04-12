/**
 * Built-in FX slots: metadata only. Keep order identical to legacy `S.fx` indices.
 */
import type { FxSlotDefinition } from './FXSlot';

const activeNonZero = (amount: number): boolean => amount !== 0;

export const BUILTIN_FX_SLOTS = [
  { index: 0, id: 'edge', name: 'edge', defaultAmount: 0, isControlActive: activeNonZero, attachment: 'post', runOrder: 0 },
  { index: 1, id: 'blursat', name: 'blursat', defaultAmount: 0, isControlActive: activeNonZero, attachment: 'post', runOrder: 20 },
  { index: 2, id: 'lightray', name: 'lightray', defaultAmount: 0, isControlActive: activeNonZero, attachment: 'post', runOrder: 10 },
  {
    index: 3,
    id: 'zoom',
    name: 'zoom',
    defaultAmount: 0,
    isControlActive: activeNonZero,
    attachment: 'post',
    runOrder: 1,
  },
  { index: 4, id: 'loufi', name: 'loufi', defaultAmount: 0, isControlActive: activeNonZero, attachment: 'main', runOrder: 1 },
  {
    index: 5,
    id: 'echo',
    name: 'echo',
    defaultAmount: 0,
    isControlActive: activeNonZero,
    attachment: 'main',
    runOrder: 0,
  },
  {
    index: 6,
    id: 'kaleido',
    name: 'kaleido',
    defaultAmount: 0,
    isControlActive: (a) => Math.abs(a) > 30,
    attachment: 'post',
    runOrder: 2,
    effectThresholdNote: 'Mirror draw applies only when |amount| > 30 (legacy threshold, bipolar).',
  },
  { index: 7, id: 'split', name: 'split', defaultAmount: 0, isControlActive: activeNonZero, attachment: 'post', runOrder: 3 },
] as const satisfies readonly FxSlotDefinition[];

export type FxId = (typeof BUILTIN_FX_SLOTS)[number]['id'];
