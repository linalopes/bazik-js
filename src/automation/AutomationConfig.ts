/**
 * Central tuning defaults for auto-mode behavior.
 * Values intentionally match current behavior.
 */
export interface AutomationConfig {
  maxMode: number;
  shift: {
    presetInterval: number;
    modeInterval: number;
  };
  modulation: {
    interval: number;
    par1Range: number;
    par1WeightBase: number;
    par1WeightMaxBoost: number;
    par2DriftFrequency: number;
    par2DriftAmplitude: number;
  };
  break: {
    interval: number;
    holdFrames: number;
    minBeatConfidence: number;
  };
}

export const AUTOMATION_CONFIG: AutomationConfig = {
  maxMode: 8,
  shift: {
    presetInterval: 300,
    modeInterval: 80,
  },
  modulation: {
    interval: 40,
    par1Range: 20,
    par1WeightBase: 0.75,
    par1WeightMaxBoost: 0.25,
    par2DriftFrequency: 0.05,
    par2DriftAmplitude: 2,
  },
  break: {
    interval: 640,
    holdFrames: 8,
    minBeatConfidence: 0.5,
  },
};
