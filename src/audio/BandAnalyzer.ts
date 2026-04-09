/**
 * Frequency-domain band extraction from analyser buffers (no gain / smoothing here).
 */

function bandAverage(freq: Uint8Array<ArrayBuffer>, startBin: number, endBin: number): number {
  let sum = 0;
  for (let i = startBin; i < endBin; i++) sum += freq[i]!;
  return sum / (endBin - startBin) / 255;
}

export interface RawBandEnergies {
  bass: number;
  mid: number;
  high: number;
}

/** Same bin splits as legacy `analysis.ts`. */
export function computeRawBandEnergies(freq: Uint8Array<ArrayBuffer>): RawBandEnergies {
  const len = freq.length;
  const bassEnd = Math.floor(len * 0.04);
  const midEnd = Math.floor(len * 0.25);
  const highEnd = Math.floor(len * 0.7);
  return {
    bass: bandAverage(freq, 0, bassEnd),
    mid: bandAverage(freq, bassEnd, midEnd),
    high: bandAverage(freq, midEnd, highEnd),
  };
}

export function applyEqGain(
  raw: RawBandEnergies,
  gain: { bass: number; mid: number; high: number },
): RawBandEnergies {
  return {
    bass: raw.bass * gain.bass,
    mid: raw.mid * gain.mid,
    high: raw.high * gain.high,
  };
}

/** Normalized 0–1 RMS from byte time-domain data (centre 128). */
export function computeRmsNormalized(time: Uint8Array<ArrayBuffer>): number {
  let sumSq = 0;
  for (let i = 0; i < time.length; i++) {
    const x = (time[i]! - 128) / 128;
    sumSq += x * x;
  }
  return Math.sqrt(sumSq / time.length);
}

/** Scale overall RMS by average EQ gain so “processed” tracks slider intent. */
export function scaleRmsForProcessed(rawRms: number, gain: { bass: number; mid: number; high: number }): number {
  const g = (gain.bass + gain.mid + gain.high) / 3;
  return rawRms * g;
}
