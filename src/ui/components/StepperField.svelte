<script lang="ts">
  export let value: string;
  /** Extra classes on the wrapper, e.g. `screen-blend-stepper` */
  export let wrapperClass = '';
  export let onMinus: () => void;
  export let onPlus: () => void;
</script>

<div class="par-field {wrapperClass}">
  <button type="button" class="par-adj" on:click={onMinus}>−</button>
  <span class="par-val">{value}</span>
  <button type="button" class="par-adj" on:click={onPlus}>+</button>
</div>
