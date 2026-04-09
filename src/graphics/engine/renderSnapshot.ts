/**
 * Immutable view of state needed for one canvas frame.
 * Built from legacy `S` at the start of each frame in {@link ../../graphics/render.ts}.
 */
import { S } from '../../core/state';

export interface RenderSnapshot {
  readonly frame: number;
  readonly speed: number;
  readonly explode: number;
  readonly currentPreset: number;
  readonly currentMode: number;
  readonly par1: number;
  readonly par2: number;
  readonly fx: readonly number[];
  readonly eq: readonly [number, number, number];
  readonly fade: number;
  readonly isBreak: boolean;
  readonly colors: readonly string[];
  readonly banger: number;
}

export function getRenderSnapshot(): RenderSnapshot {
  return {
    frame: S.frame,
    speed: S.speed,
    explode: S.explode,
    currentPreset: S.currentPreset,
    currentMode: S.currentMode,
    par1: S.par1,
    par2: S.par2,
    fx: [...S.fx],
    eq: [S.eq[0]!, S.eq[1]!, S.eq[2]!] as const,
    fade: S.fade,
    isBreak: S.isBreak,
    colors: [...S.colors],
    banger: S.banger,
  };
}
