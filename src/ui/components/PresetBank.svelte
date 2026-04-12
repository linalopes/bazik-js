<script lang="ts">
  import { onMount } from 'svelte';
  import { tick } from 'svelte';
  import { getAllPresetEntries, initializePresetRegistry } from '../../presets/PresetRegistry';
  import { refreshPresetList } from '../../presets/list';
  import { selectPreset } from '../../input/actions';
  import { currentPreset } from '../../core/state';
  import PresetThumb from './PresetThumb.svelte';

  let entries = [...getAllPresetEntries()];

  onMount(() => {
    void (async () => {
      await initializePresetRegistry();
      refreshPresetList();
      await tick();
      entries = [...getAllPresetEntries()];
    })();
  });
</script>

<div class="preset-bank" id="preset-bank">
  {#each entries as entry, i (entry.manifest.id + '-' + i)}
    <PresetThumb {entry} index={i} active={$currentPreset === i} onPick={selectPreset} />
  {/each}
</div>
