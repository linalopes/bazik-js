/**
 * One-frame audio analysis orchestration: input → raw features → processed features → beat gate.
 */
import type { AudioFeatures } from './types';
import { pullAnalyserFrames, getAnalyserSnapshot, isLiveAudioActive } from './AudioInput';
import {
  computeRawBandEnergies,
  applyEqGain,
  computeRmsNormalized,
  scaleRmsForProcessed,
} from './BandAnalyzer';
import { EnergyMovingAverage } from './FeatureSmoother';
import { detectBeatFromBassEnergy } from './BeatDetector';

const EH_LEN = 30;
const bassEnergyForBeat = new EnergyMovingAverage(EH_LEN);

export interface AudioEngineFrameDeps {
  frame: number;
  currentMode: number;
  eqGain: { bass: number; mid: number; high: number };
}

function simulateFeatures(deps: AudioEngineFrameDeps): AudioFeatures {
  bassEnergyForBeat.clear();
  const t = deps.frame * 0.015;
  const rawBass = Math.abs(Math.sin(t * 1.1)) * 0.8 + 0.1;
  const rawMid = Math.abs(Math.sin(t * 1.7 + 1)) * 0.6 + 0.1;
  const rawHigh = Math.abs(Math.sin(t * 2.5 + 2)) * 0.4 + 0.05;
  const raw = {
    bass: rawBass,
    mid: rawMid,
    high: rawHigh,
    rms: Math.sqrt((rawBass * rawBass + rawMid * rawMid + rawHigh * rawHigh) / 3),
  };
  const processedBands = applyEqGain(
    { bass: raw.bass, mid: raw.mid, high: raw.high },
    deps.eqGain,
  );
  const processed = {
    ...processedBands,
    rms: scaleRmsForProcessed(raw.rms, deps.eqGain),
  };
  const beatPulse: 0 | 1 = Math.abs(Math.sin(t * 0.48)) > 0.9 ? 1 : 0;
  const bpmDisplayValue = 120 + deps.currentMode * 4;
  return {
    raw,
    processed,
    beatPulse,
    beatConfidence: beatPulse ? 1 : 0,
    bpmEstimate: null,
    bpmDisplayValue,
    bpmDisplayIsApprox: true,
  };
}

function liveFeatures(deps: AudioEngineFrameDeps): AudioFeatures {
  pullAnalyserFrames();
  const snap = getAnalyserSnapshot();
  if (!snap) {
    return simulateFeatures(deps);
  }
  const rawBands = computeRawBandEnergies(snap.frequencyData);
  const rawRms = computeRmsNormalized(snap.timeDomainData);
  const raw = {
    ...rawBands,
    rms: rawRms,
  };
  const processedBands = applyEqGain(rawBands, deps.eqGain);
  const processed = {
    ...processedBands,
    rms: scaleRmsForProcessed(rawRms, deps.eqGain),
  };

  bassEnergyForBeat.push(processed.bass);
  const avgE = bassEnergyForBeat.average();
  const { beatPulse, beatConfidence } = detectBeatFromBassEnergy(processed.bass, avgE);

  const bpmDisplayValue = processed.bass * 60 + 90;
  return {
    raw,
    processed,
    beatPulse,
    beatConfidence,
    bpmEstimate: null,
    bpmDisplayValue,
    bpmDisplayIsApprox: false,
  };
}

export function runAudioAnalysisFrame(deps: AudioEngineFrameDeps): AudioFeatures {
  if (!isLiveAudioActive()) {
    return simulateFeatures(deps);
  }
  return liveFeatures(deps);
}
