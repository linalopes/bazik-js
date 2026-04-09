import { type InputRouter } from './InputRouter';
import { isButtonSemantic, resolveKeydown, resolveKeyup } from './ShortcutMap';
import { captureControllerLearnKey } from './controllerLearn';

/**
 * Subscribes to keyboard events, resolves physical keys → semantics, dispatches via {@link InputRouter}.
 * Intended for a hardware controller that emits standard key codes.
 */
export class KeyboardInput {
  constructor(private router: InputRouter) {}

  private onKeyDown = (e: Event): void => {
    if (!(e instanceof KeyboardEvent)) return;
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
    if (captureControllerLearnKey(e)) {
      e.preventDefault();
      return;
    }

    const resolved = resolveKeydown(e);
    if (!resolved) return;

    if (e.repeat && isButtonSemantic(resolved.id)) return;
    if (e.repeat && resolved.id === 'transport.shift') return;
    if (e.repeat && resolved.id === 'transport.prevPreset') return;
    if (e.repeat && resolved.id === 'transport.nextPreset') return;
    if (e.repeat && resolved.id === 'transport.setMode') return;

    this.router.handleDown(resolved.id, resolved.mode, e);
  };

  private onKeyUp = (e: Event): void => {
    if (!(e instanceof KeyboardEvent)) return;
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

    const resolved = resolveKeyup(e);
    if (!resolved) return;

    this.router.handleUp(resolved.id);
  };

  attach(target: Document | HTMLElement = document): void {
    target.addEventListener('keydown', this.onKeyDown);
    target.addEventListener('keyup', this.onKeyUp);
  }

  detach(target: Document | HTMLElement = document): void {
    target.removeEventListener('keydown', this.onKeyDown);
    target.removeEventListener('keyup', this.onKeyUp);
  }
}
