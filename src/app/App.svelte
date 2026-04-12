<script lang="ts">
  import '../ui/styles/app.css';
  import { onMount } from 'svelte';
  import { init } from './init';
  import * as actions from '../input/actions';
  import { closeColorPicker, cpLightnessChange, cpHexChange } from '../ui/colorPicker';
  import { activeTopTab } from '../ui/stores/navStore';
  import {
    currentPreset,
    currentMode,
    par1,
    par2,
    fade,
    activeColorBank,
    micActive,
    isBreak,
    banger,
    fps,
    eq,
  } from '../core/state';
  import { PRESETS } from '../presets/list';
  import BangButton from '../ui/components/BangButton.svelte';
  import ToggleButton from '../ui/components/ToggleButton.svelte';
  import StepperField from '../ui/components/StepperField.svelte';
  import PresetBank from '../ui/components/PresetBank.svelte';
  import ColorSwatches from '../ui/components/ColorSwatches.svelte';

  onMount(() => void init());

  $: presetLabel = PRESETS[$currentPreset]?.name ?? '—';
  $: modeLabel = 'mode ' + $currentMode;
  $: xyLeftPct = (($par1 + 100) / 200) * 100;
  $: xyTopPct = (1 - ($par2 + 100) / 200) * 100;
  $: micLabel = $micActive ? 'mic on' : 'mic off';
  $: eqStatusText = $eq[0].toFixed(2) + ' / ' + $eq[1].toFixed(2) + ' / ' + $eq[2].toFixed(2);

  const bankIndices = [0, 1, 2, 3, 4, 5, 6, 7] as const;
</script>

<div id="app">
  <div class="app-shell">
  <div class="bazik-js-root" id="bazik-js-root">
    <div class="topbar">
      <div class="topbar-left">
        <div class="logo">Bazik <span>JS</span></div>
      </div>
      <div class="topbar-center">
        <div class="nav-tabs">
          <button
            type="button"
            class="tab"
            class:active={$activeTopTab === 'controls'}
            id="tab-controls"
            on:click={() => actions.switchTab('controls')}>controls</button>
          <button
            type="button"
            class="tab"
            class:active={$activeTopTab === 'presets'}
            id="tab-presets"
            on:click={() => actions.switchTab('presets')}>presets</button>
          <button
            type="button"
            class="tab"
            class:active={$activeTopTab === 'options'}
            id="tab-options"
            on:click={() => actions.switchTab('options')}>options</button>
        </div>
      </div>
      <div class="topbar-right">
        <div class="bpm-display" id="bpm-display">-- BPM</div>
        <ToggleButton
          variant="mic"
          active={$micActive}
          label={micLabel}
          on:click={() => void actions.toggleMic()}
        />
        <BangButton clazz="btn-small" on:click={(e) => actions.saveState(e)}>save</BangButton>
        <BangButton clazz="btn-small" on:click={() => actions.cloneState()}>clone</BangButton>
      </div>
    </div>

    <div class="main-grid">
      <div class="left-panel">
        <div class="section">
          <div class="panel-label">controller</div>
          <div class="controller-row">
          <button type="button" class="controller-btn" id="controller-learn-btn" on:click={() => actions.toggleControllerLearn()}>controller learn</button>
          <BangButton clazz="controller-btn reset" on:click={() => actions.resetControllerMappings()}>reset map</BangButton>
          </div>
        </div>

        <div class="section">
          <div class="panel-label">input gain</div>
          <div class="eq-gain-row">
            <div class="eq-band">
              <input type="range" class="eq-gain-slider bass" id="gain-bass" min="0" max="100" value="75" on:input={(e) => actions.setEqGain('bass', e.currentTarget.value)} />
              <span class="eq-band-label bass">low</span>
            </div>
            <div class="eq-band">
              <input type="range" class="eq-gain-slider mid" id="gain-mid" min="0" max="100" value="60" on:input={(e) => actions.setEqGain('mid', e.currentTarget.value)} />
              <span class="eq-band-label mid">mid</span>
            </div>
            <div class="eq-band">
              <input type="range" class="eq-gain-slider high" id="gain-high" min="0" max="100" value="50" on:input={(e) => actions.setEqGain('high', e.currentTarget.value)} />
              <span class="eq-band-label high">high</span>
            </div>
          </div>
          <div class="eq-meter-row">
            <div class="eq-meter-bar bass" id="eq0"></div>
            <div class="eq-meter-bar bass" id="eq1"></div>
            <div class="eq-meter-bar bass" id="eq2"></div>
            <div class="eq-meter-bar mid" id="eq3"></div>
            <div class="eq-meter-bar mid" id="eq4"></div>
            <div class="eq-meter-bar mid" id="eq5"></div>
            <div class="eq-meter-bar high" id="eq6"></div>
            <div class="eq-meter-bar high" id="eq7"></div>
            <div class="eq-meter-bar high" id="eq8"></div>
          </div>
        </div>

        <div class="section">
          <div class="panel-label">screen</div>
          <div class="screen-blend-col">
            <div class="knob-wrap">
              <div class="knob" id="knob-screen" data-param="screen" data-val="0"></div>
              <span class="knob-label">blend</span>
            </div>
            <StepperField
              value={String($fade)}
              wrapperClass="screen-blend-stepper"
              onMinus={() => actions.adjustScreenBlend(-5)}
              onPlus={() => actions.adjustScreenBlend(5)}
            />
          </div>
        </div>

        <div class="section">
          <div class="panel-label">colors</div>
          <ColorSwatches />
          <div class="color-bank-btns" id="color-bank-btns">
            {#each bankIndices as bi}
              <ToggleButton
                variant="cbank"
                active={$activeColorBank === bi}
                label={String(bi + 1)}
                on:click={() => actions.selectColorBank(bi)}
              />
            {/each}
          </div>
        </div>
      </div>

      <div class="center-panel">
        <div class="preview-wrap">
          <canvas id="main-canvas" width="960" height="540"></canvas>
          <div class="preview-overlay">
            <span class="preview-badge" id="preset-badge">{presetLabel}</span>
            <span class="preview-badge pink" id="mode-badge">{modeLabel}</span>
          </div>
          <div class="beat-flash" id="beat-flash"></div>
        </div>
        <div class="preview-transport">
          <div class="transport-row">
            <BangButton clazz="transport-btn shift-btn" data-controller-target="shift" on:click={() => actions.doShift()}>shift</BangButton>
            <div class="nav-arrows">
              <BangButton clazz="arrow-btn" data-controller-target="preset.prev" on:click={() => actions.prevPreset()}>◀</BangButton>
              <BangButton clazz="arrow-btn" data-controller-target="preset.next" on:click={() => actions.nextPreset()}>▶</BangButton>
            </div>
            <BangButton
              clazz="transport-btn break-btn"
              id="break-center"
              data-controller-target="break"
              pressed={$isBreak}
              on:mousedown={() => actions.startBreak()}
              on:mouseup={() => actions.endBreak()}
            >break</BangButton>
          </div>
        </div>
      </div>

      <div class="right-panel">
        <div class="section">
          <div class="panel-label">parameters</div>
          <div class="param-knob-par-grid">
            <div class="param-column">
              <div class="knob-wrap">
                <div class="knob" id="knob-speed" data-param="speed" data-val="0"></div>
                <span class="knob-label">speed</span>
              </div>
              <StepperField
                value={String($par1)}
                onMinus={() => actions.adjustPar('par1', -5)}
                onPlus={() => actions.adjustPar('par1', 5)}
              />
            </div>
            <div class="param-column">
              <div class="knob-wrap">
                <div class="knob" id="knob-explode" data-param="explode" data-val="0"></div>
                <span class="knob-label">explode</span>
              </div>
              <StepperField
                value={String($par2)}
                onMinus={() => actions.adjustPar('par2', -5)}
                onPlus={() => actions.adjustPar('par2', 5)}
              />
            </div>
          </div>
        </div>

        <div class="xy-pad-section section">
          <div class="panel-label">xy control</div>
          <div class="xy-pad" id="xy-pad">
            <div class="xy-grid-h"></div>
            <div class="xy-grid-v"></div>
            <div
              class="xy-dot"
              id="xy-dot"
              style:left="{xyLeftPct}%"
              style:top="{xyTopPct}%"
            ></div>
          </div>
        </div>

        <div class="right-bottom-row">
          <div class="right-par-group-label">reset</div>
          <BangButton clazz="right-btn" on:click={() => actions.randomizePars()}>pars</BangButton>
          <BangButton clazz="right-btn" on:click={() => actions.toggleFxPanel()}>fx</BangButton>
        </div>
      </div>
    </div>

    <div class="lower-band">
      <PresetBank />

      <div class="fx-strip" id="fx-strip">
        <div class="fx-grid" id="fx-grid"></div>
      </div>

      <div class="status-bar">
        <div class="status-item">preset <span id="st-preset">{presetLabel}</span></div>
        <div class="status-item">mode <span id="st-mode">{$currentMode}</span></div>
        <div class="status-item">par1 <span id="st-par1">{$par1}</span></div>
        <div class="status-item">par2 <span id="st-par2">{$par2}</span></div>
        <div class="status-item">eq <span id="st-eq">{eqStatusText}</span></div>
        <div class="status-item warn" id="st-beat" style:display={$banger ? 'block' : 'none'}>● <span>beat</span></div>
        <div class="status-item" id="st-fps">fps <span>{$fps}</span></div>
      </div>
    </div>

    <div class="cp-overlay" id="cp-overlay" role="presentation" on:click={() => closeColorPicker()}></div>
    <div class="cp-popover" id="cp-popover" style="display:none">
      <div class="cp-wheel-wrap">
        <canvas id="cp-wheel" width="160" height="160"></canvas>
        <div class="cp-wheel-cursor" id="cp-cursor" style="left:80px;top:80px"></div>
      </div>
      <div class="cp-lightness-row">
        <span class="cp-l-label">L</span>
        <input type="range" class="cp-l-slider" id="cp-l-slider" min="0" max="100" value="50" on:input={(e) => cpLightnessChange(e.currentTarget.value)} />
      </div>
      <div class="cp-hex-row">
        <span class="cp-hash">#</span>
        <input type="text" class="cp-hex-input" id="cp-hex" maxlength="6" value="CAD8D8" on:input={(e) => cpHexChange(e.currentTarget.value)} />
      </div>
      <div class="cp-preview" id="cp-preview"></div>
      <button type="button" class="cp-close" on:click={() => closeColorPicker()}>done</button>
    </div>
  </div>
  </div>

  <div
    class="viewport-gate"
    role="dialog"
    aria-modal="true"
    aria-labelledby="viewport-gate-title"
  >
    <div class="viewport-gate-card">
      <p class="viewport-gate-brand">Bazik <span>JS</span></p>
      <h1 id="viewport-gate-title" class="viewport-gate-title">Use a larger screen or rotate to landscape</h1>
      <p class="viewport-gate-body">
        This interface is built for desktop and laptop use. For the best experience, open Bazik JS on a wide display
        or rotate your device to landscape.
      </p>
    </div>
  </div>
</div>
