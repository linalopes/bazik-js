import { writable } from 'svelte/store';
import { S } from './singleton';
import type { ParKey } from './types';

/** Core runtime fields not owned by preset/transport/color/fx stores. */
export const autoMode = writable(S.autoMode);
export const controllerLearn = writable(S.controllerLearn);
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

export function writeControllerLearn(v: boolean): void {
  S.controllerLearn = v;
  controllerLearn.set(v);
}

export function writeMicActive(v: boolean): void {
  S.micActive = v;
  micActive.set(v);
}

export function writePar(k: ParKey, v: number): void {
  const c = clampBipolarKnob(v);
  if (k === 'par1') {
    S.par1 = c;
    par1.set(c);
    S.speed = c;
    speed.set(c);
  } else {
    S.par2 = c;
    par2.set(c);
    S.explode = c;
    explode.set(c);
  }
}

export function clampBipolarKnob(v: number): number {
  return Math.max(-100, Math.min(100, Math.round(v)));
}

export function writeSpeed(v: number): void {
  const c = clampBipolarKnob(v);
  S.speed = c;
  speed.set(c);
  S.par1 = c;
  par1.set(c);
}

export function writeExplode(v: number): void {
  const c = clampBipolarKnob(v);
  S.explode = c;
  explode.set(c);
  S.par2 = c;
  par2.set(c);
}

export function adjustSpeed(delta: number): void {
  writeSpeed(S.speed + delta);
}

export function adjustExplode(delta: number): void {
  writeExplode(S.explode + delta);
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
  const c = Math.max(-100, Math.min(100, Math.round(v)));
  S.fade = c;
  fade.set(c);
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
