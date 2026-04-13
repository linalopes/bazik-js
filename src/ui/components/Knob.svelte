<script lang="ts">
  export let label: string;
  export let value: number;
  export let min = -100;
  export let max = 100;
  export let id: string | undefined = undefined;
  export let dataParam: string | undefined = undefined;
  export let onChange: (next: number) => void;

  let dragging = false;

  $: deg = (value / 100) * 140;

  function clampRound(v: number): number {
    return Math.max(min, Math.min(max, Math.round(v)));
  }

  function onMouseDown(e: MouseEvent): void {
    e.preventDefault();
    dragging = true;
    const startY = e.clientY;
    const startVal = value;

    const onMove = (ev: MouseEvent): void => {
      const delta = Math.round((startY - ev.clientY) * 0.8);
      onChange(clampRound(startVal + delta));
    };

    const onUp = (): void => {
      dragging = false;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }
</script>

<div class="knob-wrap">
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div
    class="knob"
    class:dragging
    {id}
    data-param={dataParam}
    data-val={String(value)}
    on:mousedown={onMouseDown}
  >
    <div class="knob-indicator" style:transform={`translateX(-50%) rotate(${deg}deg)`}></div>
  </div>
  <span class="knob-label">{label}</span>
</div>
