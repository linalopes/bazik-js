<script lang="ts">
  import { colors, activeColor } from '../../core/state';
  import { openColorPicker } from '../colorPicker';

  function borderForHex(hex: string): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const lum = r * 0.299 + g * 0.587 + b * 0.114;
    return lum < 40 ? 'rgba(202,216,216,0.3)' : '';
  }
</script>

<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
<div class="color-swatches" id="color-swatches">
  {#each $colors as c, i (i)}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div
      class="swatch"
      class:active={$activeColor === i}
      style:background={c}
      style:border-color={borderForHex(c) || undefined}
      on:click={(e) => {
        e.stopPropagation();
        void openColorPicker(i, e.currentTarget);
      }}
      on:keydown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          void openColorPicker(i, e.currentTarget);
        }
      }}
      role="button"
      tabindex="0"
    ></div>
  {/each}
</div>
