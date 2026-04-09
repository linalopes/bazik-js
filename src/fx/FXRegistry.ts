/**
 * Immutable built-in FX registry. Later: merge async-loaded FX packs.
 */
import { BUILTIN_FX_SLOTS } from './builtinSlots';
import type { FxSlotDefinition } from './FXSlot';

export type { FxSlotDefinition };

export function getAllFxSlots(): readonly FxSlotDefinition[] {
  return BUILTIN_FX_SLOTS;
}

export function getFxSlotAt(index: number): FxSlotDefinition | undefined {
  return BUILTIN_FX_SLOTS[index];
}

export function getFxSlotCount(): number {
  return BUILTIN_FX_SLOTS.length;
}

export function getFxSlotIndexById(id: string): number {
  return BUILTIN_FX_SLOTS.findIndex((s) => s.id === id);
}

export function getFxSlotById(id: string): FxSlotDefinition | undefined {
  return BUILTIN_FX_SLOTS.find((s) => s.id === id);
}
