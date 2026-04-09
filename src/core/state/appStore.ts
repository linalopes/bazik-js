import { writable } from 'svelte/store';
import { S } from './singleton';
import type { ParKey } from './types';

/** Core runtime fields not owned by preset/transport/color/fx stores. */
export const autoMode = writable(S.autoMode);
export const midiLearn = writable(S.midiLearn);
export const micActive = writable(S.micActive);
export const par1 = writable(S.par1);
export const par2 = writable(S.par2);
export const speed = writable(S.speed);
export const explode = writable(S.explode);
export const banger = writable(S.banger);
export const isBreak = writable(S.isBreak);
export const fade = writable(S.fade);
export const frame = writable(S.frame);
export const xy = writable({ ...S.xy });
export const autoTimer = writable(S.autoTimer);
export const fps = writable(S.fps);
export const lastFpsTime = writable(S.lastFpsTime);
export const fpsCount = writable(S.fpsCount);
export const eq = writable<[number, number, number]>([...S.eq]);

export function writeAutoMode(v: boolean): void {
  S.autoMode = v;
  autoMode.set(v);
}

export function writeMidiLearn(v: boolean): void {
  S.midiLearn = v;
  midiLearn.set(v);
}

export function writeMicActive(v: boolean): void {
  S.micActive = v;
  micActive.set(v);
}

export function writePar(k: ParKey, v: number): void {
  if (k === 'par1') {
    S.par1 = v;
    par1.set(v);
  } else {
    S.par2 = v;
    par2.set(v);
  }
}

export function writeSpeed(v: number): void {
  S.speed = v;
  speed.set(v);
}

export function writeExplode(v: number): void {
  S.explode = v;
  explode.set(v);
}

export function adjustSpeed(delta: number): void {
  writeSpeed(Math.max(0, Math.min(100, S.speed + delta)));
}

export function adjustExplode(delta: number): void {
  writeExplode(Math.max(0, Math.min(100, S.explode + delta)));
}

export function writeBanger(v: number): void {
  S.banger = v;
  banger.set(v);
}

export function writeIsBreak(v: boolean): void {
  S.isBreak = v;
  isBreak.set(v);
}

export function writeFade(v: number): void {
  S.fade = v;
  fade.set(v);
}

export function writeFrame(v: number): void {
  S.frame = v;
  frame.set(v);
}

export function bumpFrame(): void {
  writeFrame(S.frame + 1);
}

export function writeXy(next: { x: number; y: number }): void {
  S.xy = { ...next };
  xy.set({ ...next });
}

export function writeAutoTimer(v: number): void {
  S.autoTimer = v;
  autoTimer.set(v);
}

export function bumpAutoTimer(): void {
  writeAutoTimer(S.autoTimer + 1);
}

export function writeFpsTriple(f: number, fc: number, t: number): void {
  S.fps = f;
  S.fpsCount = fc;
  S.lastFpsTime = t;
  fps.set(f);
  fpsCount.set(fc);
  lastFpsTime.set(t);
}

export function incrementFpsCounter(): void {
  S.fpsCount++;
  fpsCount.set(S.fpsCount);
}

export function writeEqBand(i: 0 | 1 | 2, v: number): void {
  const next: [number, number, number] = [...S.eq] as [number, number, number];
  next[i] = v;
  S.eq = next;
  eq.set(next);
}

export function writeEqAll(next: [number, number, number]): void {
  S.eq = next;
  eq.set([...next]);
}
