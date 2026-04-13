<script lang="ts">
  import { fxLevels, fxArmed, writeFxAt, adjustFxAt, toggleFxArmAt } from '../../core/state/fxStore';
  import { isFxControlActive } from '../../fx/FXManager';
  import { controllerLearn } from '../../core/state';
  import { controllerLearnSelectedTargetId } from '../stores/controllerLearnUiStore';

  /** Registry id (controller targets, persistence keys). */
  export let id: string;
  /** Visible strip label. */
  export let label: string;
  export let index: number;

  $: value = $fxLevels[index] ?? 0;
  $: armed = $fxArmed[index] === true;
  $: active = armed && isFxControlActive(index, value);
  $: deg = (value / 100) * 140;
  $: controllerTarget = `fx.${id}.toggle`;

  function onKnobMouseDown(e: MouseEvent): void {
    e.preventDefault();
    const startY = e.clientY;
    const startVal = value;
    const onMove = (ev: MouseEvent): void => {
      const delta = Math.round((startY - ev.clientY) * 0.8);
      const nv = Math.max(-100, Math.min(100, Math.round(startVal + delta)));
      writeFxAt(index, nv);
    };
    const onUp = (): void => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }
</script>

<div
  class="fx-slot"
  class:fx-active={active}
  class:fx-armed={armed}
  class:fx-unarmed={!armed}
  id="fx-slot-{index}"
>
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div
    class="fx-knob"
    class:active-knob={armed}
    id="fxknob-{index}"
    on:mousedown={onKnobMouseDown}
  >
    <div
      class="fx-knob-indicator"
      id="fxind-{index}"
      style:transform="translateX(-50%) rotate({deg}deg)"
    ></div>
  </div>
  <div class="fx-par-row">
    <button type="button" class="fx-par-btn" on:click={() => adjustFxAt(index, -5)}>−</button>
    <span class="fx-par-val" id="fxval-{index}">{value}</span>
    <button type="button" class="fx-par-btn" on:click={() => adjustFxAt(index, 5)}>+</button>
  </div>
  <button
    type="button"
    class="fx-arm-btn"
    class:armed
    class:controller-learn-target={$controllerLearn}
    class:controller-learn-selected={$controllerLearnSelectedTargetId === controllerTarget}
    id="fxarm-{index}"
    data-fx-arm={index}
    data-controller-target={controllerTarget}
    on:click={() => toggleFxArmAt(index)}
  >
    {armed ? 'on' : 'off'}
  </button>
  <span class="fx-name">{label}</span>
</div>
