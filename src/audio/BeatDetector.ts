/**
 * Beat / transient gate from energy vs smoothed history (legacy thresholds).
 */

const BASS_SPIKE_RATIO = 1.4;
const BASS_ABS_FLOOR = 0.3;

export interface BeatDetectionResult {
  beatPulse: 0 | 1;
  beatConfidence: number;
}

export function detectBeatFromBassEnergy(processedBass: number, bassMovingAverage: number): BeatDetectionResult {
  const threshold = bassMovingAverage * BASS_SPIKE_RATIO;
  const on = processedBass > threshold && processedBass > BASS_ABS_FLOOR;
  const beatPulse: 0 | 1 = on ? 1 : 0;
  let beatConfidence = 0;
  if (bassMovingAverage > 1e-6) {
    beatConfidence = Math.min(1, Math.max(0, processedBass / threshold - 1));
  } else if (on) {
    beatConfidence = 1;
  }
  return { beatPulse, beatConfidence };
}
