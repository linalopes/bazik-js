/**
 * Serializable FX slot contract (UI + routing). Amounts live in `S.fx[slotIndex]` (0–100).
 * Execution is wired in code via `src/fx/execution/*` and `graphics/engine/Renderer`.
 */

export type FxSlotIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

/** Attachment point in the Canvas 2D frame (legacy split: main pass vs post stack). */
export type FxAttachment = 'main' | 'post';

export interface FxSlotDefinition {
  readonly index: FxSlotIndex;
  readonly id: string;
  readonly name: string;
  readonly defaultAmount: number;
  /** Knob / strip “active” styling (legacy: amount > 0). */
  readonly isControlActive: (amount: number) => boolean;
  readonly attachment: FxAttachment;
  /**
   * Order within the attachment group. Lower runs first.
   * Post pass uses a bundled composite phase then overlay passes — see `postPassPipeline`.
   */
  readonly runOrder: number;
  /** Human note when the effect no-ops below a threshold (e.g. kaleido). */
  readonly effectThresholdNote?: string;
}
