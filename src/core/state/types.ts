export interface AppState {
  autoMode: boolean;
  controllerLearn: boolean;
  micActive: boolean;
  currentPreset: number;
  currentMode: number;
  par1: number;
  par2: number;
  speed: number;
  explode: number;
  fx: number[];
  eq: [number, number, number];
  banger: number;
  isBreak: boolean;
  /** Preview screen blend: −100 full black, 0 normal, +100 full white washout. */
  fade: number;
  frame: number;
  xy: { x: number; y: number };
  colors: string[];
  activeColor: number;
  /** Which color bank row index is active; kept in sync with `activeColorBank` store. */
  activeColorBank: number;
  autoTimer: number;
  fps: number;
  lastFpsTime: number;
  fpsCount: number;
}

export type ParKey = 'par1' | 'par2';
