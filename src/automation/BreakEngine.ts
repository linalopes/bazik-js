/**
 * Conservative beat-gated auto-break pulses for auto mode.
 * Rare and short to avoid chaotic output.
 */
import { AUTOMATION_CONFIG } from './AutomationConfig';

export interface BreakInputs {
  autoTimer: number;
  beatPulse: number;
  beatConfidence: number;
}

export class BreakEngine {
  private holdFrames = 0;

  step(inputs: BreakInputs): { isBreakActive: boolean } {
    if (this.holdFrames > 0) {
      this.holdFrames -= 1;
      return { isBreakActive: true };
    }

    const shouldTrigger =
      inputs.autoTimer >= AUTOMATION_CONFIG.break.interval &&
      inputs.autoTimer % AUTOMATION_CONFIG.break.interval === 0 &&
      inputs.beatPulse === 1 &&
      inputs.beatConfidence >= AUTOMATION_CONFIG.break.minBeatConfidence;

    if (shouldTrigger) {
      this.holdFrames = AUTOMATION_CONFIG.break.holdFrames;
      return { isBreakActive: true };
    }

    return { isBreakActive: false };
  }
}
