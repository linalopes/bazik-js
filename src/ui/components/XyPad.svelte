<script lang="ts">
  export let valueX: number;
  export let valueY: number;
  export let min = -100;
  export let max = 100;
  export let onChangeX: (next: number) => void;
  export let onChangeY: (next: number) => void;

  let padEl: HTMLDivElement;
  let dragging = false;

  $: leftPct = ((valueX - min) / (max - min)) * 100;
  $: topPct = (1 - (valueY - min) / (max - min)) * 100;

  function clamp(v: number): number {
    return Math.max(min, Math.min(max, Math.round(v)));
  }

  function moveFromClient(clientX: number, clientY: number): void {
    if (!padEl) return;
    const rect = padEl.getBoundingClientRect();
    const x01 = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const y01 = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
    const nextX = min + x01 * (max - min);
    const nextY = min + (1 - y01) * (max - min);
    onChangeX(clamp(nextX));
    onChangeY(clamp(nextY));
  }

  function onMouseDown(e: MouseEvent): void {
    dragging = true;
    moveFromClient(e.clientX, e.clientY);
  }

  function onTouchStart(e: TouchEvent): void {
    dragging = true;
    moveFromClient(e.touches[0]!.clientX, e.touches[0]!.clientY);
    e.preventDefault();
  }

  function onWindowMouseMove(e: MouseEvent): void {
    if (!dragging) return;
    moveFromClient(e.clientX, e.clientY);
  }

  function onWindowTouchMove(e: TouchEvent): void {
    if (!dragging) return;
    moveFromClient(e.touches[0]!.clientX, e.touches[0]!.clientY);
  }
</script>

<svelte:window
  on:mousemove={onWindowMouseMove}
  on:mouseup={() => (dragging = false)}
  on:touchmove={onWindowTouchMove}
  on:touchend={() => (dragging = false)}
/>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
  class="xy-pad"
  id="xy-pad"
  bind:this={padEl}
  on:mousedown={onMouseDown}
  on:touchstart={onTouchStart}
>
  <div class="xy-grid-h"></div>
  <div class="xy-grid-v"></div>
  <div class="xy-dot" id="xy-dot" style:left={`${leftPct}%`} style:top={`${topPct}%`}></div>
</div>
