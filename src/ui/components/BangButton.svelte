<script lang="ts">
  /** Full `class` string so existing CSS bundles (bang / trigger) stay unchanged. */
  export let clazz: string;
  /** e.g. break button while held / auto break */
  export let pressed = false;
  export let learnTarget = false;
  export let learnSelected = false;
</script>

<button
  type="button"
  class={clazz}
  class:pressed
  class:controller-learn-target={learnTarget}
  class:controller-learn-selected={learnSelected}
  on:click
  on:mousedown
  on:mouseup
  {...$$restProps}
>
  <slot />
</button>
