/**
 * Facade for FX slot lookup and display strings.
 */
import { getAllFxSlots, getFxSlotAt, getFxSlotById, getFxSlotCount, getFxSlotIndexById } from './FXRegistry';
import type { FxSlotDefinition } from './FXSlot';
import type { FxId } from './builtinSlots';

export { getAllFxSlots, getFxSlotAt, getFxSlotById, getFxSlotCount, getFxSlotIndexById };
export type { FxSlotDefinition, FxSlotIndex } from './FXSlot';
export type { FxId };

/** Display names in strip order (legacy `FX_NAMES`). */
export const FX_NAMES: readonly string[] = getAllFxSlots().map((s) => s.name);

export function isFxControlActive(slotIndex: number, amount: number): boolean {
  return getFxSlotAt(slotIndex)?.isControlActive(amount) ?? amount > 0;
}
