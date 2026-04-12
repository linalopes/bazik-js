<script lang="ts">
  import type { PresetEntry } from '../../presets/PresetRegistry';
  import { drawThumb } from '../presetBank';

  export let entry: PresetEntry;
  export let index: number;
  export let active: boolean;
  export let onPick: (i: number) => void;

  let canvas: HTMLCanvasElement;

  $: if (canvas) void drawThumb(canvas, index, entry);
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
  class="preset-thumb"
  class:active
  id="preset-{index}"
  on:click={() => onPick(index)}
  role="button"
  tabindex="0"
  on:keydown={(e) => e.key === 'Enter' && onPick(index)}
>
  <canvas bind:this={canvas} width="64" height="64"></canvas>
  <div class="pt-label">{entry.manifest.name}</div>
</div>
