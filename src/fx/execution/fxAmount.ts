import type { RenderSnapshot } from '../../graphics/engine/renderSnapshot';
import { getFxSlotById } from '../FXRegistry';
import type { FxId } from '../builtinSlots';

const fxIndexCache = new Map<FxId, number>();

function resolveFxIndex(fxId: FxId): number | undefined {
  const cached = fxIndexCache.get(fxId);
  if (cached !== undefined) return cached;
  const slot = getFxSlotById(fxId);
  if (!slot) return undefined;
  fxIndexCache.set(fxId, slot.index);
  return slot.index;
}

/** FX amount lookup by slot id (falls back to 0 for unknown ids). */
export function getFxAmount(snapshot: RenderSnapshot, fxId: FxId): number {
  const i = resolveFxIndex(fxId);
  return i === undefined ? 0 : snapshot.fx[i] ?? 0;
}
