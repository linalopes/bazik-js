/**
 * Serializable FX slot contract (UI + future GPU routing). Amounts live in `S.fx[slotIndex]` (−100…+100, bipolar).
 * Phase 1: strip is inert — no runtime FX execution yet.
 */

export type FxSlotIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

/** Reserved grouping for when FX are reattached to a GPU pipeline (legacy names kept). */
export type FxAttachment = 'main' | 'post';

export interface FxSlotDefinition {
  readonly index: FxSlotIndex;
  readonly id: string;
  readonly name: string;
  readonly defaultAmount: number;
  /** Knob / strip “active” styling (legacy: amount > 0). */
  readonly isControlActive: (amount: number) => boolean;
  readonly attachment: FxAttachment;
  /** Order within the attachment group when execution exists again. */
  readonly runOrder: number;
  /** Human note when the effect no-ops below a threshold (e.g. kaleido). */
  readonly effectThresholdNote?: string;
}
