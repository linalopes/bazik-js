<script lang="ts">
  import { colors, writeColorAt } from '../../core/state';
  import { colorPickerUi } from '../stores/colorPickerStore';
  import { closeColorPicker } from '../colorPicker';
  import { hexToHsl, hslToHex } from '../../utils/color';

  let wheelCanvas: HTMLCanvasElement;
  let wheelDragging = false;
  let h = 0;
  let s = 0;
  let l = 50;
  let initializedForTarget = -1;

  $: open = $colorPickerUi.open;
  $: targetIndex = $colorPickerUi.targetIndex;
  $: top = $colorPickerUi.top;
  $: left = $colorPickerUi.left;

  $: if (open && targetIndex !== initializedForTarget) {
    const hex = $colors[targetIndex] ?? '#CAD8D8';
    const hsl = hexToHsl(hex);
    h = hsl[0];
    s = hsl[1];
    l = hsl[2];
    initializedForTarget = targetIndex;
  }

  $: if (!open) {
    initializedForTarget = -1;
    wheelDragging = false;
  }

  $: hex = hslToHex(h, s, l);
  $: hexInput = hex.slice(1).toUpperCase();
  $: cursorAngle = (h * Math.PI) / 180;
  $: cursorDist = (s / 100) * 78;
  $: cursorLeft = 80 + Math.cos(cursorAngle) * cursorDist;
  $: cursorTop = 80 + Math.sin(cursorAngle) * cursorDist;
  $: lightnessGradient = `linear-gradient(to right, hsl(${h},${s}%,0%), hsl(${h},${s}%,50%), hsl(${h},${s}%,100%))`;

  $: if (open && wheelCanvas) {
    drawColorWheel();
  }

  $: if (open) {
    writeColorAt(targetIndex, hex);
  }

  function drawColorWheel(): void {
    const ctx = wheelCanvas.getContext('2d');
    if (!ctx) return;
    const cx = 80;
    const cy = 80;
    const r = 78;
    ctx.clearRect(0, 0, 160, 160);
    for (let angle = 0; angle < 360; angle += 1) {
      const startA = ((angle - 1) * Math.PI) / 180;
      const endA = ((angle + 1) * Math.PI) / 180;
      const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      grd.addColorStop(0, `hsl(${angle},0%,50%)`);
      grd.addColorStop(1, `hsl(${angle},100%,50%)`);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, startA, endA);
      ctx.closePath();
      ctx.fillStyle = grd;
      ctx.fill();
    }
    ctx.globalCompositeOperation = 'destination-in';
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
  }

  function pickFromWheel(clientX: number, clientY: number): void {
    const rect = wheelCanvas.getBoundingClientRect();
    const x = clientX - rect.left - 80;
    const y = clientY - rect.top - 80;
    const dist = Math.min(Math.sqrt(x * x + y * y), 78);
    const angle = (Math.atan2(y, x) * 180) / Math.PI;
    h = ((angle % 360) + 360) % 360;
    s = Math.round((dist / 78) * 100);
  }

  function onWheelMouseDown(e: MouseEvent): void {
    wheelDragging = true;
    pickFromWheel(e.clientX, e.clientY);
  }

  function onWheelTouchStart(e: TouchEvent): void {
    wheelDragging = true;
    pickFromWheel(e.touches[0]!.clientX, e.touches[0]!.clientY);
    e.preventDefault();
  }

  function onWindowMouseMove(e: MouseEvent): void {
    if (!wheelDragging) return;
    pickFromWheel(e.clientX, e.clientY);
  }

  function onWindowTouchMove(e: TouchEvent): void {
    if (!wheelDragging) return;
    pickFromWheel(e.touches[0]!.clientX, e.touches[0]!.clientY);
  }

  function onLightnessInput(val: string): void {
    l = parseInt(val, 10);
  }

  function onHexInput(val: string): void {
    if (val.length !== 6) return;
    try {
      const next = hexToHsl('#' + val);
      h = next[0];
      s = next[1];
      l = next[2];
    } catch {
      // Ignore invalid intermediate input.
    }
  }
</script>

<svelte:window
  on:mousemove={onWindowMouseMove}
  on:mouseup={() => (wheelDragging = false)}
  on:touchmove={onWindowTouchMove}
  on:touchend={() => (wheelDragging = false)}
/>

{#if open}
  <div class="cp-overlay open" id="cp-overlay" role="presentation" on:click={() => closeColorPicker()}></div>
  <div class="cp-popover" id="cp-popover" style:top={`${top}px`} style:left={`${left}px`}>
    <div class="cp-wheel-wrap">
      <canvas
        id="cp-wheel"
        width="160"
        height="160"
        bind:this={wheelCanvas}
        on:mousedown={onWheelMouseDown}
        on:touchstart={onWheelTouchStart}
      ></canvas>
      <div class="cp-wheel-cursor" id="cp-cursor" style:left={`${cursorLeft}px`} style:top={`${cursorTop}px`}></div>
    </div>
    <div class="cp-lightness-row">
      <span class="cp-l-label">L</span>
      <input
        type="range"
        class="cp-l-slider"
        id="cp-l-slider"
        min="0"
        max="100"
        value={String(l)}
        style:background={lightnessGradient}
        on:input={(e) => onLightnessInput(e.currentTarget.value)}
      />
    </div>
    <div class="cp-hex-row">
      <span class="cp-hash">#</span>
      <input
        type="text"
        class="cp-hex-input"
        id="cp-hex"
        maxlength="6"
        value={hexInput}
        on:input={(e) => onHexInput(e.currentTarget.value)}
      />
    </div>
    <div class="cp-preview" id="cp-preview" style:background={hex}></div>
    <button type="button" class="cp-close" on:click={() => closeColorPicker()}>done</button>
  </div>
{/if}
