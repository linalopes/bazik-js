import { S, bumpFrame, bumpAutoTimer, incrementFpsCounter, writeFpsTriple, eqGain, writeIsBreak } from '../core/state';
import { analyzeAudio } from '../audio/analysis';
import { getRenderSnapshot } from './engine/renderSnapshot';
import { renderFrame } from './engine/Renderer';
import { updateUI, syncBeatFlashOverlay } from '../ui/statusAndEq';
import { nextPreset, setMode, adjustPar } from '../input/actions';
import { autoPilot } from '../automation/AutoPilot';

/**
 * App tick: audio features → preview canvas placeholder → status line / meters → auto-pilot.
 */
export function render(): void {
  const audio = analyzeAudio({
    frame: S.frame,
    currentMode: S.currentMode,
    eqGain: { bass: eqGain.bass, mid: eqGain.mid, high: eqGain.high },
  });

  const snapshot = getRenderSnapshot();
  renderFrame(snapshot);

  syncBeatFlashOverlay(S.banger === 1);
  updateUI();
  bumpFrame();

  autoPilot.step(
    {
      autoMode: S.autoMode,
      autoTimer: S.autoTimer,
      currentMode: S.currentMode,
    },
    {
      beatPulse: audio.beatPulse,
      beatConfidence: audio.beatConfidence,
      banger: S.banger,
      frame: S.frame,
    },
    {
      bumpAutoTimer,
      shiftPreset: nextPreset,
      setMode,
      adjustPar,
      setBreak: writeIsBreak,
    },
  );

  incrementFpsCounter();
  const now = performance.now();
  if (now - S.lastFpsTime > 1000) {
    writeFpsTriple(S.fpsCount, 0, now);
  }

  requestAnimationFrame(render);
}
