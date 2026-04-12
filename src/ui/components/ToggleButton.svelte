<script lang="ts">
  export let active = false;
  /** `mic` → .mic-status + #mic-btn; `cbank` → .cbank-btn */
  export let variant: 'mic' | 'cbank';
  export let label: string;
</script>

{#if variant === 'mic'}
  <button
    type="button"
    class="mic-status"
    class:active
    id="mic-btn"
    on:click
    {...$$restProps}
  >
    {label}
  </button>
{:else}
  <button type="button" class="cbank-btn" class:active on:click {...$$restProps}>
    {label}
  </button>
{/if}
