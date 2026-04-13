export interface AppState {
  autoMode: boolean;
  controllerLearn: boolean;
  micActive: boolean;
  currentPreset: number;
  currentMode: number;
  /** Generic primary parameter model (UI label currently "speed"). */
  par1: number;
  /** Generic secondary parameter model (UI label currently "explode"). */
  par2: number;
  /** Current preset-facing label for `par1`; mirrored with `par1` by write functions. */
  speed: number;
  /** Current preset-facing label for `par2`; mirrored with `par2` by write functions. */
  explode: number;
  fx: number[];
  eq: [number, number, number];
  banger: number;
  isBreak: boolean;
  /** Bipolar screen blend control: −100 full black, 0 neutral, +100 full white washout. */
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
