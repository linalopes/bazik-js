/**
 * Explicit audio features for one analysis tick.
 *
 * - **raw**: band levels and RMS from analyser bins, before EQ gain or banger logic.
 * - **processed**: bands (and derived RMS scale) after per-band `eqGain` — mirrors legacy `S.eq` drive.
 * - **BPM**: Real tempo is not estimated; `bpmDisplayValue` keeps the previous UI heuristic. See `bpmEstimate`.
 */
export interface AudioFeatures {
  readonly raw: {
    readonly bass: number;
    readonly mid: number;
    readonly high: number;
    readonly rms: number;
  };
  readonly processed: {
    readonly bass: number;
    readonly mid: number;
    readonly high: number;
    readonly rms: number;
  };
  /** Binary pulse (legacy `banger`): transient / beat gate for visuals. */
  readonly beatPulse: 0 | 1;
  /** 0–1 strength of on-beat belief (derived from energy vs moving average). */
  readonly beatConfidence: number;
  /**
   * Reserved for future true BPM estimation. Always `null` today — tempo is not tracked.
   * Do not use for musical timing without implementing a detector.
   */
  readonly bpmEstimate: null;
  /** Value shown in the BPM label (same formulas as pre-refactor). */
  readonly bpmDisplayValue: number;
  /** When true, UI may show “~” (simulation / no live input). */
  readonly bpmDisplayIsApprox: boolean;
}
