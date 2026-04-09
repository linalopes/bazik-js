<script lang="ts">
  import '../ui/styles/app.css';
  import { onMount } from 'svelte';
  import { init } from './init';
  import * as actions from '../input/actions';
  import { closeColorPicker, cpLightnessChange, cpHexChange } from '../ui/colorPicker';

  onMount(() => void init());
</script>

<div id="app">
  <div class="bazik-root" id="bazik">
    <div class="topbar">
      <div class="topbar-left">
        <div class="logo">BA<span>Z</span>IK<sub>.js</sub></div>
      </div>
      <div class="topbar-center">
        <div class="nav-tabs">
          <button type="button" class="tab active" id="tab-controls" on:click={() => actions.switchTab('controls')}>controls</button>
          <button type="button" class="tab" id="tab-presets" on:click={() => actions.switchTab('presets')}>presets</button>
          <button type="button" class="tab" id="tab-options" on:click={() => actions.switchTab('options')}>options</button>
        </div>
      </div>
      <div class="topbar-right">
        <div class="bpm-display" id="bpm-display">-- BPM</div>
        <button type="button" class="mic-status" id="mic-btn" on:click={() => actions.toggleMic()}>mic off</button>
        <button type="button" class="btn-small" on:click={(e) => actions.saveState(e)}>save</button>
        <button type="button" class="btn-small" on:click={() => actions.cloneState()}>clone</button>
      </div>
    </div>

    <div class="main-grid">
      <div class="left-panel">
        <div class="section">
          <div class="panel-label">controller</div>
          <div class="controller-row">
          <button type="button" class="midi-btn" id="midi-btn" on:click={() => actions.toggleMidiLearn()}>controller learn</button>
          <button type="button" class="midi-btn reset" on:click={() => actions.resetControllerMappings()}>reset map</button>
          </div>
        </div>

        <div class="section">
          <div class="panel-label">input gain</div>
          <div class="eq-gain-row">
            <div class="eq-band">
              <input type="range" class="eq-gain-slider bass" id="gain-bass" min="0" max="100" value="75" on:input={(e) => actions.setEqGain('bass', e.currentTarget.value)} />
              <span class="eq-band-label bass">B</span>
            </div>
            <div class="eq-band">
              <input type="range" class="eq-gain-slider mid" id="gain-mid" min="0" max="100" value="60" on:input={(e) => actions.setEqGain('mid', e.currentTarget.value)} />
              <span class="eq-band-label mid">M</span>
            </div>
            <div class="eq-band">
              <input type="range" class="eq-gain-slider high" id="gain-high" min="0" max="100" value="50" on:input={(e) => actions.setEqGain('high', e.currentTarget.value)} />
              <span class="eq-band-label high">H</span>
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
          <div class="screen-actions">
            <button type="button" class="action-btn fade-action" id="screen-blackout-btn" on:click={() => actions.triggerBlackout()}>blackout</button>
          </div>
          <div class="fade-row">
            <span class="panel-label fade-inline-label">fade</span>
            <input type="range" class="fade-slider-h" id="fade-slider" min="0" max="100" value="100" on:input={(e) => actions.setFade(e.currentTarget.value)} />
            <span class="panel-label" style="margin:0;min-width:22px;color:var(--gray-green)" id="fade-val">100</span>
          </div>
        </div>

        <div class="section">
          <div class="panel-label">colors</div>
          <div class="color-swatches" id="color-swatches"></div>
          <div class="color-bank-btns" id="color-bank-btns">
            <button type="button" class="cbank-btn active" on:click={() => actions.selectColorBank(0)}>1</button>
            <button type="button" class="cbank-btn" on:click={() => actions.selectColorBank(1)}>2</button>
            <button type="button" class="cbank-btn" on:click={() => actions.selectColorBank(2)}>3</button>
            <button type="button" class="cbank-btn" on:click={() => actions.selectColorBank(3)}>4</button>
            <button type="button" class="cbank-btn" on:click={() => actions.selectColorBank(4)}>5</button>
            <button type="button" class="cbank-btn" on:click={() => actions.selectColorBank(5)}>6</button>
            <button type="button" class="cbank-btn" on:click={() => actions.selectColorBank(6)}>7</button>
            <button type="button" class="cbank-btn" on:click={() => actions.selectColorBank(7)}>8</button>
          </div>
        </div>
      </div>

      <div class="center-panel">
        <div class="preview-wrap">
          <canvas id="main-canvas" width="960" height="540"></canvas>
          <div class="preview-overlay">
            <span class="preview-badge" id="preset-badge">scatter</span>
            <span class="preview-badge pink" id="mode-badge">mode 1</span>
          </div>
          <div class="beat-flash" id="beat-flash"></div>
        </div>
      </div>

      <div class="right-panel">
        <div class="section">
          <div class="panel-label">speed &amp; explode</div>
          <div class="knob-row">
            <div class="knob-wrap">
              <div class="knob" id="knob-speed" data-param="speed" data-val="50"></div>
              <span class="knob-label">speed</span>
              <span class="knob-val" id="knob-speed-val">50</span>
            </div>
            <div class="knob-wrap">
              <div class="knob" id="knob-explode" data-param="explode" data-val="30"></div>
              <span class="knob-label">explode</span>
              <span class="knob-val" id="knob-explode-val">30</span>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="panel-label">par 1 / par 2</div>
          <div class="par-row">
            <div class="par-field" style="flex:1">
              <button type="button" class="par-adj" on:click={() => actions.adjustPar('par1', -5)}>−</button>
              <span class="par-val" id="par1r-val">0</span>
              <button type="button" class="par-adj" on:click={() => actions.adjustPar('par1', 5)}>+</button>
            </div>
            <div class="par-field" style="flex:1">
              <button type="button" class="par-adj" on:click={() => actions.adjustPar('par2', -5)}>−</button>
              <span class="par-val" id="par2-val">0</span>
              <button type="button" class="par-adj" on:click={() => actions.adjustPar('par2', 5)}>+</button>
            </div>
          </div>
        </div>

        <div class="xy-pad-section section">
          <div class="panel-label">xy control — par1 × par2</div>
          <div class="xy-pad" id="xy-pad">
            <div class="xy-grid-h"></div>
            <div class="xy-grid-v"></div>
            <div class="xy-dot" id="xy-dot" style="left:50%;top:50%"></div>
          </div>
          <div class="xy-labels">
            <span class="panel-label" style="margin:0">par 1 →</span>
            <span class="panel-label" style="margin:0">par 2 ↑</span>
          </div>
        </div>

        <div class="right-bottom-row">
          <button type="button" class="right-btn" on:click={() => actions.resetPars()}>reset</button>
          <button type="button" class="right-btn" on:click={() => actions.randomizePars()}>random</button>
          <button type="button" class="right-btn" on:click={() => actions.toggleFxPanel()}>fx</button>
        </div>
      </div>
    </div>

    <div class="lower-band">
      <div class="transport-row">
        <button type="button" class="transport-btn shift-btn" data-controller-target="shift" on:click={() => actions.doShift()}>shift</button>
        <div class="nav-arrows">
          <button type="button" class="arrow-btn" data-controller-target="preset.prev" on:click={() => actions.prevPreset()}>◀</button>
          <button type="button" class="arrow-btn" data-controller-target="preset.next" on:click={() => actions.nextPreset()}>▶</button>
        </div>
        <button type="button" class="transport-btn break-btn" id="break-center" data-controller-target="break" on:mousedown={() => actions.startBreak()} on:mouseup={() => actions.endBreak()}>break</button>
      </div>

      <div>
        <div class="panel-label">preset bank</div>
        <div class="preset-bank" id="preset-bank"></div>
      </div>

      <div class="fx-strip" id="fx-strip">
        <div class="panel-label">post-fx chain</div>
        <div class="fx-grid" id="fx-grid"></div>
      </div>

      <div class="status-bar">
        <div class="status-item">preset <span id="st-preset">scatter</span></div>
        <div class="status-item">mode <span id="st-mode">1</span></div>
        <div class="status-item">par1 <span id="st-par1">0</span></div>
        <div class="status-item">par2 <span id="st-par2">0</span></div>
        <div class="status-item">eq <span id="st-eq">0.0 / 0.0 / 0.0</span></div>
        <div class="status-item warn" id="st-beat" style="display:none">● <span>beat</span></div>
        <div class="status-item" id="st-fps">fps <span>--</span></div>
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
