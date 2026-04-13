<script lang="ts">
  import FxSlot from './FxSlot.svelte';
  import { BUILTIN_FX_SLOTS } from '../../fx/builtinSlots';
  import { fxPanelOpen } from '../stores/fxPanelStore';

  /** Strip labels (registry `name` stays lowercase for legacy strings). */
  const LABEL_BY_ID: Record<string, string> = {
    edge: 'Edge',
    blursat: 'BlurSat',
    lightray: 'LightRay',
    zoom: 'Zoom',
    loufi: 'LoFi',
    echo: 'Echo',
    kaleido: 'Kaleido',
    split: 'Split',
  };
</script>

<div class="fx-strip" id="fx-strip" style:display={$fxPanelOpen ? 'block' : 'none'}>
  <div class="fx-grid" id="fx-grid">
    {#each BUILTIN_FX_SLOTS as def (def.id)}
      <FxSlot index={def.index} id={def.id} label={LABEL_BY_ID[def.id] ?? def.name} />
    {/each}
  </div>
</div>
