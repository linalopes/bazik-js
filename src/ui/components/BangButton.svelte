<script lang="ts">
  /** Full `class` string so existing CSS bundles (bang / trigger) stay unchanged. */
  export let clazz: string;
  /** e.g. break button while held / auto break */
  export let pressed = false;
</script>

<button
  type="button"
  class={clazz}
  class:pressed
  on:click
  on:mousedown
  on:mouseup
  {...$$restProps}
>
  <slot />
</button>
