<template>
  <!-- Swatch-only (CONTEXT.md, ADR-0070): a readonly field that opens the
       panel like c-select's, showing the picked swatch's chip and name. -->
  <span
    v-if="swatchesOnly"
    :ref="bindAnchor"
    :style="anchorStyle"
    class="block w-full"
  >
    <c-input
      :ref="bindField"
      :active="isOpen"
      :data-hide-details="String(hideDetailsResolved)"
      :disabled
      :error-message
      :filled="!!fieldText"
      :hint
      :input-id
      :label
      :label-on-top="labelOnTopResolved"
      :required
      :shadow="shadowResolved"
      :size="sizeResolved"
      :valid
      @click="onFieldClick"
    >
      <span v-if="committedColor" slot="pre" :class="ui.pre()">
        <span
          :class="ui.chip({ small: sizeResolved === 'small' })"
          :style="chipStyle(committedColor)"
          aria-hidden="true"
          part="color-chip"
        />
      </span>

      <div :class="ui.content()" class="c-input__content">
        <input
          :id="inputId"
          ref="comboRef"
          :aria-expanded="isOpen"
          :aria-invalid="!valid || undefined"
          :aria-label="label || undefined"
          :class="ui.combo()"
          :disabled
          :name="name || undefined"
          :value="fieldText"
          aria-haspopup="dialog"
          autocomplete="off"
          class="c-typed-field__input"
          part="input"
          role="combobox"
          type="text"
          readonly
          @keydown="onComboKeyDown"
        />
      </div>

      <span slot="post" :class="ui.post({ small: sizeResolved === 'small' })">
        <c-icon-button
          v-if="clearable && committedColor"
          :aria-label="t.clearSelection"
          :disabled
          size="x-small"
          text
          @click="onSwatchClear"
        >
          <c-icon :path="mdiClose" :size="20" />
        </c-icon-button>

        <c-icon-button
          v-else
          :aria-label="t.toggleSwatches"
          :disabled
          size="x-small"
          text
          @click="onChevronClick"
        >
          <c-icon :path="mdiChevronDown" :size="24" />
        </c-icon-button>
      </span>
    </c-input>
  </span>

  <!-- The editable value field (ADR-0058): `src/shared/TypedField.vue`. -->
  <typed-field
    v-else
    :anchor-style
    :clear-label="t.clearSelection"
    :clearable
    :disabled
    :error-message
    :field="typed"
    :hide-details="hideDetailsResolved"
    :hint
    :input-id
    :label
    :label-on-top="labelOnTopResolved"
    :name
    :open="isOpen"
    :required
    :shadow="shadowResolved"
    :size="sizeResolved"
    :valid
    inputmode="text"
  >
    <!-- The colour button (CONTEXT.md): painted with the current colour. -->
    <template #trigger="{ buttonSize }">
      <c-icon-button
        :aria-label="t.openPicker"
        :disabled
        :size="buttonSize"
        aria-haspopup="dialog"
        text
        @click="onColorButtonClick"
      >
        <span
          :class="ui.chip({ empty: !committedColor })"
          :style="chipStyle(committedColor)"
          part="color-chip"
        />
      </c-icon-button>
    </template>
  </typed-field>

  <!-- Manual popover in the top layer; light dismiss, positioning and the
       fullscreen layout come from `useAnchoredPanel`. -->
  <div
    ref="panelRef"
    :class="ui.panel()"
    :style="panelStyle"
    part="panel"
    popover="manual"
    @toggle="onToggle"
  >
    <!-- A dialog (ADR-0058, ADR-0070): real DOM focus moves into the panel
         and Tab cycles inside the card. -->
    <div
      ref="cardRef"
      :aria-label="label || t.chooseColor"
      :class="ui.card()"
      :style="cardStyle"
      aria-modal="true"
      part="card"
      role="dialog"
      @keydown="onPanelKeyDown"
    >
      <panel-heading-row
        v-if="layout === 'fullscreen'"
        :close-label="t.closePanel"
        :heading="label || t.chooseColor"
        @close="closePanel(true)"
      />

      <div :class="ui.body()">
        <template v-if="!swatchesOnly">
          <!-- The colour area (CONTEXT.md): one Tab stop over two visually
               hidden native ranges — Left/Right saturation, Up/Down
               brightness (ADR-0070). -->
          <div
            :class="ui.area()"
            :style="{ '--_c-color-picker-hue': hsv.h }"
            part="area"
            @lostpointercapture="onAreaPointerEnd"
            @pointercancel="onAreaPointerEnd"
            @pointerdown="onAreaPointerDown"
            @pointermove="onAreaPointerMove"
            @pointerup="onAreaPointerEnd"
          >
            <input
              v-for="axis in AREA_AXES"
              :key="axis"
              :aria-label="axis === 's' ? t.saturation : t.brightness"
              :aria-valuetext="`${Math.round(hsv[axis])}%`"
              :data-axis="axis"
              :tabindex="areaAxis === axis ? 0 : -1"
              :value="Math.round(hsv[axis])"
              class="sr-only"
              max="100"
              min="0"
              step="1"
              type="range"
              @change="settle"
              @input="onAreaInput(axis, $event)"
              @keydown="onAreaKeyDown"
            />

            <span
              :class="ui.thumb()"
              :style="{
                left: `${hsv.s}%`,
                top: `${100 - hsv.v}%`,
                '--_c-color-picker-opaque': toCss({ ...panelColor, a: 255 }),
              }"
              aria-hidden="true"
              part="area-thumb"
            />
          </div>

          <input
            :aria-label="t.hue"
            :aria-valuetext="`${Math.round(hsv.h)}°`"
            :class="ui.range()"
            :value="Math.round(hsv.h)"
            class="c-color-picker__hue"
            max="359"
            min="0"
            part="hue-slider"
            step="1"
            tabindex="0"
            type="range"
            @change="settle"
            @input="onHueInput"
            @keydown="onRangeKeyDown"
          />

          <input
            v-if="alphaOn"
            :aria-label="t.alpha"
            :aria-valuetext="`${alphaPercent}%`"
            :class="ui.range()"
            :style="{
              '--_c-color-picker-opaque': toCss({ ...panelColor, a: 255 }),
            }"
            :value="alphaPercent"
            class="c-color-picker__alpha"
            max="100"
            min="0"
            part="alpha-slider"
            step="1"
            tabindex="0"
            type="range"
            @change="settle"
            @input="onAlphaInput"
            @keydown="onRangeKeyDown"
          />

          <!-- The colour comparison (CONTEXT.md): the original colour,
               restorable, beside the colour the panel holds. -->
          <div v-if="originalColor" :class="ui.comparison()" part="comparison">
            <button
              :aria-label="t.restoreOriginal"
              :class="ui.original()"
              :style="chipStyle(originalColor)"
              part="original-color"
              type="button"
              @click="restoreOriginal"
            />

            <span
              :class="ui.newColor()"
              :style="chipStyle(panelColor)"
              aria-hidden="true"
              part="new-color"
            />
          </div>

          <!-- The notation switch (CONTEXT.md): a view of the channel editor
               only — never the value's notation (ADR-0069). -->
          <div
            :aria-label="t.notation"
            :class="ui.notationSwitch()"
            part="notation-switch"
            role="group"
          >
            <button
              v-for="n in NOTATIONS"
              :key="n"
              :aria-pressed="view === n"
              :class="ui.notation()"
              part="notation"
              type="button"
              @click="view = n"
            >
              {{ n.toUpperCase() }}
            </button>
          </div>

          <!-- The channel editor (CONTEXT.md): typed text commits on Enter or
               blur, Up/Down nudge and commit. -->
          <div
            :aria-label="view.toUpperCase()"
            :class="ui.channels()"
            part="channels"
            role="group"
          >
            <label
              v-for="channel in editorChannels"
              :key="channel.key"
              :class="ui.channel({ wide: channel.key === 'hex' })"
            >
              <span :class="ui.channelLabel()" aria-hidden="true">
                {{ channel.short }}
              </span>

              <input
                :aria-label="channel.name"
                :class="ui.channelInput()"
                :inputmode="channel.key === 'hex' ? 'text' : 'decimal'"
                :value="channelValue(channel.key)"
                autocomplete="off"
                part="channel"
                spellcheck="false"
                tabindex="0"
                type="text"
                @blur="onChannelCommit(channel.key, $event)"
                @keydown="onChannelKeyDown(channel.key, $event)"
              />
            </label>
          </div>
        </template>

        <!-- The swatches (CONTEXT.md): one Tab stop; arrows move, Enter,
             Space or a click picks (ADR-0070). A transient list: hidden
             scrollbar and a peek when it overflows (ADR-0043). -->
        <div
          v-if="swatchList.length"
          ref="swatchesRef"
          :aria-label="t.swatches"
          :class="ui.swatches()"
          part="swatches"
          role="listbox"
        >
          <div
            v-for="(swatch, i) in swatchList"
            :key="swatch.key"
            :aria-label="swatch.label"
            :aria-selected="i === selectedSwatch"
            :class="ui.swatch()"
            :style="chipStyle(swatch.color)"
            :tabindex="i === swatchFocus ? 0 : -1"
            part="swatch"
            role="option"
            @click="pickSwatch(i)"
            @keydown="onSwatchKeyDown(i, $event)"
          />
        </div>
      </div>

      <!-- The fullscreen panel's Done button (ADR-0066) commits the pending
           colour; a swatch-only panel has none — a pick commits there. -->
      <div v-if="confirming" :class="ui.actions()" part="actions">
        <button :class="ui.done()" part="done" type="button" @click="pickDone">
          {{ t.done }}
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import type { CFieldSize } from '../../types';

/** The notation a colour picker's value is written in (CONTEXT.md "Notation"). */
export type CColorPickerFormat = 'hex' | 'oklch' | 'rgb';

export interface CColorPickerProps {
  /**
   * Let the colour carry transparency: an alpha slider and an A channel join
   * the panel. Without it typed alpha is dropped
   *
   * @defaultable false
   */
  alpha?: boolean;

  /**
   * Make the value clearable
   */
  clearable?: boolean;

  /**
   * Disable the field
   */
  disabled?: boolean;

  /**
   * Error message shown in place of the hint while the field is invalid
   *
   * @freeform
   */
  errorMessage?: string;

  /**
   * The notation the value is written in — and every emission with it:
   * `#rrggbb`, `rgb(r g b)` or `oklch(l c h)`
   *
   * @defaultable 'hex'
   */
  format?: CColorPickerFormat;

  /**
   * Hide the hint and error messages
   *
   * @defaultable false
   */
  hideDetails?: boolean;

  /**
   * Hint text for the field
   *
   * @freeform
   */
  hint?: string;

  /**
   * Id of the element
   *
   * @freeform
   */
  hostId?: string;

  /**
   * Element label
   *
   * @freeform
   */
  label?: string;

  /**
   * Label on top of the field
   *
   * @defaultable false
   */
  labelOnTop?: boolean;

  /**
   * Input field name
   *
   * @freeform
   */
  name?: string;

  /**
   * Placeholder of the input; an example of the notation when empty
   *
   * @freeform
   */
  placeholder?: string;

  /**
   * Set the field as required
   */
  required?: boolean;

  /**
   * Shadow variant
   *
   * @defaultable false
   */
  shadow?: boolean;

  /**
   * Field height: the 52px default (the shared control height) or the 36px `small` box
   *
   * @defaultable 'default'
   */
  size?: CFieldSize;

  /**
   * Predefined colours offered under the picker — CSS colours, or
   * `{ value, name }` objects whose name is read out and shown. Arrays have
   * no attribute form — bind as a DOM property
   */
  swatches?: CColorPickerSwatch[];

  /**
   * Limit the choice to the swatches: the field becomes readonly and opens
   * a panel of the swatches alone
   */
  swatchesOnly?: boolean;

  /**
   * UI text overrides (i18n), merged over the English defaults. Objects have
   * no attribute form — bind as a DOM property
   *
   * @defaultable {}
   */
  texts?: CColorPickerTexts;

  /**
   * Set the validity of the field
   */
  valid?: boolean;

  /**
   * The colour in the `format` notation, or `null` when empty. Any CSS
   * colour is accepted and shown in the notation
   */
  value?: CColorPickerValue;
}

/** A predefined colour: a CSS colour, or one with a name for assistive technology and the swatch-only field. */
export type CColorPickerSwatch = { name?: string; value: string } | string;

/**
 * UI texts of `c-color-picker`, merged key by key over the English defaults.
 */
export interface CColorPickerTexts {
  /** Accessible name of the alpha slider and the A channel. */
  alpha?: string;

  /** Accessible name of the blue channel. */
  blue?: string;

  /** Accessible name of the colour area's vertical axis. */
  brightness?: string;

  /** Accessible name of the dialog when the field has no label. */
  chooseColor?: string;

  /** Accessible name of the chroma channel. */
  chroma?: string;

  /** Accessible label of the clear button. */
  clearSelection?: string;

  /** Accessible label of the close button in the fullscreen panel (narrow viewports). */
  closePanel?: string;

  /** Label of the Done button in the fullscreen panel (narrow viewports). */
  done?: string;

  /** Accessible name of the green channel. */
  green?: string;

  /** Accessible name of the hex channel. */
  hex?: string;

  /** Accessible name of the hue slider and the OKLCH hue channel. */
  hue?: string;

  /** Accessible name of the lightness channel. */
  lightness?: string;

  /** Accessible name of the notation switch. */
  notation?: string;

  /** Accessible label of the colour button. */
  openPicker?: string;

  /** Accessible name of the red channel. */
  red?: string;

  /** Accessible label of the original colour in the colour comparison: a click restores it. */
  restoreOriginal?: string;

  /** Accessible name of the colour area's horizontal axis. */
  saturation?: string;

  /** Accessible name of the swatch list. */
  swatches?: string;

  /** Accessible label of the swatch-only field's chevron button. */
  toggleSwatches?: string;
}

/** Value of `c-color-picker`: a colour in its `format` notation, or `null` when empty. */
export type CColorPickerValue = null | string;
</script>

<script setup lang="ts">
/**
 * @csspart input - The text input; under `swatches-only` the readonly field
 * @csspart separator - Unused: the shared typed field's range separator
 * @csspart color-chip - The colour painted in the colour button, or before the swatch-only field's text
 * @csspart panel - The top-layer popover container anchored below the field
 * @csspart card - The dialog surface inside the panel
 * @csspart heading-row - The top row of the fullscreen panel (narrow viewports): the field label as heading and the close button
 * @csspart heading - The field label naming the fullscreen panel
 * @csspart close - The close button of the fullscreen panel
 * @csspart area - The saturation × brightness square at the current hue
 * @csspart area-thumb - The marker of the colour in the area
 * @csspart hue-slider - The hue slider
 * @csspart alpha-slider - The alpha slider (`alpha`)
 * @csspart comparison - The strip of the original colour beside the new one, when the panel opened on a colour
 * @csspart original-color - The colour the panel opened on; a click restores it
 * @csspart new-color - The colour the panel holds now
 * @csspart notation-switch - The HEX | RGB | OKLCH row choosing the channel editor
 * @csspart notation - One button of the notation switch
 * @csspart channels - The channel editor: the inputs of one notation
 * @csspart channel - One channel input
 * @csspart swatches - The list of swatches
 * @csspart swatch - One swatch
 * @csspart actions - The row under the panel body in the fullscreen panel (narrow viewports)
 * @csspart done - The Done button of the fullscreen panel (narrow viewports): commits what the panel holds and closes
 *
 * @cssstate bad-input - Present while committed text names no colour
 */
import { mdiChevronDown, mdiClose } from '@mdi/js';
import { tv } from 'tailwind-variants';
import {
  type ComponentPublicInstance,
  computed,
  nextTick,
  ref,
  useHost,
  useId,
  useTemplateRef,
  watch,
} from 'vue';

import { useAppDefault } from '../../shared/appDefaults';
import { coerceBoolean } from '../../shared/coerceBoolean';
import PanelHeadingRow from '../../shared/PanelHeadingRow.vue';
import { applyPeekCap } from '../../shared/peekCap';
import TypedField from '../../shared/TypedField.vue';
import { useAnchoredPanel } from '../../shared/useAnchoredPanel';
import { useHostEmit } from '../../shared/useHostEmit';
import { useHostStates } from '../../shared/useHostStates';
import { useKeyboardModality } from '../../shared/useKeyboardModality';
import { useNarrowViewport } from '../../shared/useNarrowViewport';
import { useTypedField } from '../../shared/useTypedField';
import {
  channelText,
  type ColorChannel,
  type ColorNotation,
  fromHsv,
  type Hsv,
  isColor,
  NOTATION_CHANNELS,
  nudgeChannel,
  readChannel,
  readColor,
  type Rgba,
  sameColor,
  spell,
  toCss,
  toHsv,
} from './colors';

type CColorPickerAxis = 's' | 'v';

type CColorPickerEditorChannel = {
  key: 'hex' | ColorChannel;
  name: string;
  short: string;
};

/** Events dispatched by `<c-color-picker>`. */
interface CColorPickerEvents {
  /**
   * Fired when the value changes — a pick in the panel, typed text
   * committed, the field cleared — carrying the colour in the `format`
   * notation, or `null`. A drag on the area or a slider fires it once, on
   * release.
   */
  change: CColorPickerValue;

  /**
   * Fired on every commit of typed text (Enter or leaving the input) with the
   * text as typed. Read `badInput` to tell whether it named a colour.
   */
  'change:text': string;

  /**
   * Native bubbling input event dispatched alongside every value change —
   * each move of a drag included — so a plain `v-model` stays in sync.
   * Carries no detail.
   */
  input: void;

  /**
   * Fired with every value change, each move of a drag included — the
   * `v-model` contract.
   */
  'update:value': CColorPickerValue;
}

type CColorPickerSwatchRow = {
  color: Rgba;
  key: string;
  label: string;
  name: string;
};

/**
 * c-color-picker is a typeable colour field with a panel of a colour area,
 * sliders, a channel editor and swatches (CONTEXT.md "Colour picker",
 * ADR-0069, ADR-0070). Consumer customization is via `::part()` and
 * `:state(bad-input)`.
 */
const colorPicker = tv({
  slots: {
    actions: 'mx-auto flex w-full max-w-[400px] shrink-0 justify-end px-3 pb-3',
    area: 'c-color-picker__area relative h-40 shrink-0 cursor-crosshair touch-none rounded-csc-md select-none',
    body: 'flex flex-col gap-3 p-4',
    card: 'flex w-[280px] flex-col overflow-hidden rounded-csc-md bg-surface-overlay text-on-surface shadow-[2px_4px_10px_#00000029]',
    channel:
      'flex min-w-0 flex-1 flex-col items-center gap-1 text-xs text-on-surface-muted',
    channelInput:
      'h-8 w-full min-w-0 rounded-csc-md border border-solid border-divider bg-surface bg-clip-padding px-1 text-center [font-family:var(--c-font-family)] text-sm text-on-surface tabular-nums outline-none focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-primary focus-visible:outline-solid',
    channelLabel: 'leading-4 font-medium',
    channels: 'flex gap-2',
    // A chip on the colour's own ground over the checkerboard, framed by a
    // load-bearing hairline (ADR-0042) so white reads on white.
    chip: 'c-color-picker__chip block size-6 rounded-csc-sm border border-solid border-divider bg-clip-padding',
    combo:
      'm-0 w-full min-w-0 cursor-pointer border-0 bg-transparent py-2 text-base leading-5 text-on-surface outline-none [font:inherit] disabled:cursor-default disabled:text-on-surface-muted',
    comparison: 'flex h-6 shrink-0',
    content: 'flex w-full min-w-0 items-center',
    // c-button's filled look on a native button, at the heading row's 44px
    // touch target.
    done: 'ml-auto h-11 min-w-22 cursor-pointer rounded-csc-md border-0 bg-primary px-5 [font-family:var(--c-font-family)] text-sm font-bold text-on-primary outline-none hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary focus-visible:outline-solid',
    // The two halves touch with no seam, so a small shift shows; the frame
    // is the chip's hairline (ADR-0042).
    newColor:
      'c-color-picker__chip flex-1 rounded-csc-r-md border border-l-0 border-solid border-divider bg-clip-padding',
    notation:
      'h-7 flex-1 cursor-pointer rounded-csc-md border-0 bg-transparent px-2 [font-family:var(--c-font-family)] text-xs font-semibold text-on-surface-muted outline-none hover:bg-primary-subtle-hover focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary focus-visible:outline-solid aria-pressed:bg-primary aria-pressed:text-on-primary aria-pressed:hover:bg-primary-hover aria-pressed:focus-visible:-outline-offset-4 aria-pressed:focus-visible:outline-on-primary',
    notationSwitch:
      'flex gap-0.5 rounded-csc-lg border border-solid border-divider bg-surface-sunken bg-clip-padding p-0.5',
    original:
      'c-color-picker__chip m-0 flex-1 cursor-pointer rounded-csc-l-md border border-r-0 border-solid border-divider bg-clip-padding p-0 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary focus-visible:outline-solid',
    panel:
      'fixed [inset:auto] m-0 overflow-visible border-0 bg-transparent p-0',
    post: '-mr-1.5 inline-flex items-center',
    pre: 'mr-2 inline-flex items-center',
    range:
      'c-color-picker__range m-0 block h-4 w-full cursor-pointer appearance-none rounded-full bg-transparent outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary focus-visible:outline-solid',
    swatch:
      'c-color-picker__chip size-6 cursor-pointer rounded-csc-sm border border-solid border-divider bg-clip-padding outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary focus-visible:outline-solid aria-selected:outline-2 aria-selected:outline-offset-2 aria-selected:outline-on-surface aria-selected:outline-solid',
    // Ceiling 4.6 rows; the peek cap ends the grid on a half row.
    swatches:
      'grid max-h-[142px] scrollbar-hidden grid-cols-[repeat(auto-fill,24px)] justify-between gap-2.5 overflow-y-auto overscroll-contain p-1',
    thumb:
      'c-color-picker__thumb pointer-events-none absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full',
  },
  variants: {
    empty: { true: { chip: 'c-color-picker__chip--empty' } },
    fullscreen: {
      true: {
        area: 'h-auto min-h-40 flex-1',
        body: 'mx-auto min-h-0 w-full max-w-[400px] flex-1 overflow-y-auto',
        card: 'max-h-none w-auto rounded-none shadow-none',
        // The heading row's touch target.
        comparison: 'h-11',
        panel: 'overflow-hidden bg-surface-overlay',
        swatches: 'max-h-none overflow-visible',
      },
    },
    small: { true: { chip: 'size-[18px]', post: '-mr-1' } },
    wide: { true: { channel: 'flex-[3]' } },
  },
});

const AREA_AXES: CColorPickerAxis[] = ['s', 'v'];

const NOTATIONS: ColorNotation[] = ['hex', 'rgb', 'oklch'];

// What an empty field suggests typing, per notation.
const PLACEHOLDERS: Record<ColorNotation, string> = {
  hex: '#rrggbb',
  oklch: 'oklch(l c h)',
  rgb: 'rgb(r g b)',
};

const WHITE: Rgba = { a: 255, b: 255, g: 255, r: 255 };

// Two root nodes (field + panel): keep fallthrough attrs on the host.
defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<CColorPickerProps>(), {
  alpha: undefined,
  clearable: false,
  disabled: false,
  errorMessage: '',
  format: undefined,
  hideDetails: undefined,
  hint: '',
  hostId: '',
  label: '',
  labelOnTop: undefined,
  name: '',
  placeholder: '',
  required: false,
  shadow: undefined,
  size: undefined,
  swatches: () => [],
  swatchesOnly: false,
  texts: undefined,
  valid: true,
  value: null,
});

const host = useHost();

// Script focus rings after a keyboard path, an Alt+↓ open included.
const focusOptions = useKeyboardModality(host);

const emit = useHostEmit<CColorPickerEvents>();

const setState = useHostStates();

const appDefault = useAppDefault('c-color-picker', props);

const alphaOn = appDefault('alpha', false);

const formatResolved = appDefault('format', 'hex');

const hideDetailsResolved = appDefault('hideDetails', false);

const labelOnTopResolved = appDefault('labelOnTop', false);

const shadowResolved = appDefault('shadow', false);

const sizeResolved = appDefault('size', 'default');

// ---- texts: own → app default → English ------------------------------------

const DEFAULT_TEXTS: Required<CColorPickerTexts> = {
  alpha: 'Alpha',
  blue: 'Blue',
  brightness: 'Brightness',
  chooseColor: 'Choose colour',
  chroma: 'Chroma',
  clearSelection: 'Clear selection',
  closePanel: 'Close',
  done: 'Done',
  green: 'Green',
  hex: 'Hex',
  hue: 'Hue',
  lightness: 'Lightness',
  notation: 'Notation',
  openPicker: 'Open colour picker',
  red: 'Red',
  restoreOriginal: 'Restore original colour',
  saturation: 'Saturation',
  swatches: 'Swatches',
  toggleSwatches: 'Show swatches',
};

const ownTexts = appDefault('texts', {} as Required<CColorPickerTexts>);

const t = computed<Required<CColorPickerTexts>>(() => ({
  ...DEFAULT_TEXTS,
  ...Object.fromEntries(
    Object.entries(ownTexts.value).filter(([, v]) => v !== undefined),
  ),
}));

// ---- refs -----------------------------------------------------------------

const cardRef = useTemplateRef<HTMLElement>('cardRef');

const comboRef = useTemplateRef<HTMLInputElement>('comboRef');

const panelRef = useTemplateRef<HTMLElement>('panelRef');

const swatchesRef = useTemplateRef<HTMLElement>('swatchesRef');

const autoId = useId();

const inputId = computed(() => props.hostId || autoId);

// Same defineCustomElement Boolean-attribute quirk as `range` in
// c-date-picker: resolve it from the stable host attribute first.
const swatchesOnly = computed(() =>
  host?.hasAttribute('swatches-only')
    ? coerceBoolean(host.getAttribute('swatches-only'))
    : coerceBoolean(props.swatchesOnly),
);

const notation = computed<ColorNotation>(() =>
  NOTATIONS.includes(formatResolved.value) ? formatResolved.value : 'hex',
);

// The codec's pattern: the notation, and whether alpha is kept — a change of
// either re-spells the field without emitting.
const pattern = computed(() =>
  alphaOn.value ? `${notation.value}/a` : notation.value,
);

const readPattern = (text: string, p: string): null | string => {
  const [n, a] = p.split('/');

  const color = readColor(text, a === 'a');

  return color ? spell(color, n as ColorNotation) : null;
};

// ---- the typed field --------------------------------------------------------

const typed = useTypedField({
  codec: {
    format: (value, p) => readPattern(value, p) ?? value,
    // Every colour that parses is usable: outside sRGB it is mapped in.
    isUsable: () => true,
    isValue: isColor,
    parse: readPattern,
  },
  host,
  label: () => props.label,
  labelOnTop: labelOnTopResolved,
  names: () => ({ end: '', start: '' }),
  onOpenRequest: () => openPanel(),
  onTextCommit: (text) => emit('change:text', text as string),
  pattern,
  placeholder: () => props.placeholder || PLACEHOLDERS[notation.value],
  range: computed(() => false),
  reversed: 'keep',
  value: () => props.value,
});

/** Whether the committed text names no colour — the value is then `null` (CONTEXT.md "Bad input"). */
const badInput = computed<boolean>(() => typed.badInput.value);

watch(badInput, (on) => setState('bad-input', on), { immediate: true });

const committedColor = computed<null | Rgba>(() => {
  const value = typed.ends.value.start;

  return value === null ? null : readColor(value, alphaOn.value);
});

// ---- swatches ---------------------------------------------------------------

const swatchList = computed<CColorPickerSwatchRow[]>(() => {
  const rows: CColorPickerSwatchRow[] = [];

  for (const swatch of props.swatches ?? []) {
    const value = typeof swatch === 'string' ? swatch : swatch?.value;

    const color =
      typeof value === 'string' ? readColor(value, alphaOn.value) : null;

    if (!color) continue;

    const name = (typeof swatch === 'object' && swatch?.name) || '';

    rows.push({
      color,
      key: `${rows.length}:${value}`,
      label: name || spell(color, notation.value),
      name,
    });
  }

  return rows;
});

// Each problem warns once per element: a swatch naming no colour, and an
// unnamed swatch under swatches-only.
const warned = new Set<string>();

const warnOnce = (key: string, message: string) => {
  if (warned.has(key)) return;

  warned.add(key);
  console.warn(`[c-color-picker] ${message}`);
};

watch(
  [() => props.swatches, swatchesOnly],
  ([swatches, only]) => {
    for (const swatch of swatches ?? []) {
      const value = typeof swatch === 'string' ? swatch : swatch?.value;

      if (typeof value !== 'string' || !readColor(value, true)) {
        warnOnce(
          `bad:${String(value)}`,
          `swatch ${JSON.stringify(value)} names no colour; it is skipped.`,
        );
      } else if (only && !(typeof swatch === 'object' && swatch.name)) {
        warnOnce(
          'unnamed',
          'swatches-only: name every swatch ({ value, name }) — the name is what the field shows and assistive technology reads.',
        );
      }
    }
  },
  { immediate: true },
);

// ---- the panel colour --------------------------------------------------------

// The fullscreen panel's picks wait here for Done; every other way out
// discards them (ADR-0066).
const pendingColor = ref<null | Rgba>(null);

// What the panel shows as chosen: the pending colour, else the value.
const chosenColor = computed(() => pendingColor.value ?? committedColor.value);

// An empty field's panel lands on the first swatch, else white; landing
// commits nothing.
const panelColor = computed<Rgba>(
  () =>
    chosenColor.value ??
    (swatchList.value[0] ? { ...swatchList.value[0].color, a: 255 } : WHITE),
);

// The panel's own position (ADR-0070): the hue survives a grey, and a step
// the bytes cannot show still moves the thumb.
const hsv = ref<Hsv>(toHsv(panelColor.value));

watch(panelColor, (c) => {
  hsv.value = toHsv(c, hsv.value);
});

// The colour comparison's original (CONTEXT.md): the value the panel opened
// on, taken before it shows so the panel is measured with the strip in it.
const originalColor = ref<null | Rgba>(null);

const alphaPercent = computed(() =>
  Math.round((panelColor.value.a / 255) * 100),
);

const chipStyle = (c: null | Rgba) =>
  c ? { '--_c-color-picker-color': toCss(c) } : undefined;

// The text the swatch-only field shows: the picked swatch's name, else the
// value spelled in its notation.
const fieldText = computed(() => {
  const c = committedColor.value;

  if (!c) return '';

  return (
    swatchList.value.find((s) => sameColor(s.color, c))?.label ??
    spell(c, notation.value)
  );
});

// ---- committing ----------------------------------------------------------------

// The anchored panel commits live (ADR-0070): a discrete pick commits, a drag
// move only updates; the fullscreen panel holds a pending colour (ADR-0066).
const pick = (c: Rgba, kind: 'commit' | 'move' = 'commit') => {
  if (confirming.value) {
    pendingColor.value = c;

    return;
  }

  if (sameColor(c, committedColor.value)) return;

  const next = { end: null, start: spell(c, notation.value) };

  if (kind === 'move') typed.moveValue(next);
  else typed.commitValue(next);
};

// The end of a drag: one `change`, when it moved the value.
const settle = () => {
  if (!confirming.value) typed.settleValue();
};

// The colour comparison's original button: a pick of the original.
const restoreOriginal = () => {
  if (originalColor.value) pick(originalColor.value);
};

// ---- the colour area -----------------------------------------------------------

// The axis whose hidden range is the area's Tab stop: the last one moved.
const areaAxis = ref<CColorPickerAxis>('s');

const areaInput = (axis: CColorPickerAxis) =>
  cardRef.value?.querySelector<HTMLInputElement>(
    `input[data-axis="${axis}"]`,
  ) ?? null;

const clamp100 = (n: number) => Math.min(100, Math.max(0, n));

const moveTo = (next: Partial<Hsv>, kind: 'commit' | 'move') => {
  hsv.value = { ...hsv.value, ...next };
  pick(fromHsv(hsv.value, panelColor.value.a), kind);
};

// The pointer dragging over the area, while one is.
let dragPointer: null | number = null;

const placeArea = (event: PointerEvent, area: HTMLElement) => {
  const r = area.getBoundingClientRect();

  moveTo(
    {
      s: clamp100(((event.clientX - r.left) / r.width) * 100),
      v: clamp100((1 - (event.clientY - r.top) / r.height) * 100),
    },
    'move',
  );
};

const onAreaPointerDown = (event: PointerEvent) => {
  if (event.button !== 0) return;

  const area = event.currentTarget as HTMLElement;

  // No text selection and no focus of the area box itself: the active range
  // takes focus instead.
  event.preventDefault();

  try {
    area.setPointerCapture(event.pointerId);
  } catch {
    // A pointer the browser no longer tracks: the drag stays on the area.
  }

  dragPointer = event.pointerId;
  areaInput(areaAxis.value)?.focus({ preventScroll: true });
  placeArea(event, area);
};

const onAreaPointerMove = (event: PointerEvent) => {
  if (event.pointerId === dragPointer)
    placeArea(event, event.currentTarget as HTMLElement);
};

const onAreaPointerEnd = (event: PointerEvent) => {
  if (event.pointerId !== dragPointer) return;

  dragPointer = null;
  settle();
};

// Assistive technology moves a hidden range natively.
const onAreaInput = (axis: CColorPickerAxis, event: Event) => {
  areaAxis.value = axis;
  moveTo({ [axis]: (event.target as HTMLInputElement).valueAsNumber }, 'move');
};

const AREA_KEYS: Record<
  string,
  { axis: CColorPickerAxis; by?: number; to?: number }
> = {
  ArrowDown: { axis: 'v', by: -1 },
  ArrowLeft: { axis: 's', by: -1 },
  ArrowRight: { axis: 's', by: 1 },
  ArrowUp: { axis: 'v', by: 1 },
  End: { axis: 's', to: 100 },
  Home: { axis: 's', to: 0 },
  PageDown: { axis: 'v', by: -10 },
  PageUp: { axis: 'v', by: 10 },
};

const onAreaKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    pickDone();

    return;
  }

  const key = AREA_KEYS[event.key];

  if (!key) return;

  event.preventDefault();

  const { axis } = key;

  const step =
    (key.by ?? 0) * (event.shiftKey && Math.abs(key.by ?? 0) === 1 ? 10 : 1);

  const n = key.to ?? clamp100(Math.round(hsv.value[axis]) + step);

  moveTo({ [axis]: n }, 'commit');

  // The other axis's range takes the Tab stop and focus, so assistive
  // technology announces the axis that moved.
  if (axis !== areaAxis.value) {
    areaAxis.value = axis;
    nextTick(() => areaInput(axis)?.focus(focusOptions()));
  }
};

// ---- the sliders -------------------------------------------------------------

const onHueInput = (event: Event) =>
  moveTo({ h: (event.target as HTMLInputElement).valueAsNumber }, 'move');

const onAlphaInput = (event: Event) => {
  const percent = (event.target as HTMLInputElement).valueAsNumber;

  pick({ ...panelColor.value, a: Math.round((percent / 100) * 255) }, 'move');
};

const onRangeKeyDown = (event: KeyboardEvent) => {
  if (event.key !== 'Enter') return;

  event.preventDefault();
  pickDone();
};

// ---- the channel editor ------------------------------------------------------

// The channel editor shown: opens on the value's notation (ADR-0069).
const view = ref<ColorNotation>('hex');

const editorChannels = computed<CColorPickerEditorChannel[]>(() => {
  const names: Record<ColorChannel, string> = {
    a: t.value.alpha,
    b: t.value.blue,
    c: t.value.chroma,
    g: t.value.green,
    h: t.value.hue,
    l: t.value.lightness,
    r: t.value.red,
  };

  const keys: ('hex' | ColorChannel)[] =
    view.value === 'hex' ? ['hex'] : [...NOTATION_CHANNELS[view.value]];

  if (alphaOn.value) keys.push('a');

  return keys.map((key) => ({
    key,
    name: key === 'hex' ? t.value.hex : names[key],
    short: key === 'hex' ? '#' : key.toUpperCase(),
  }));
});

const channelValue = (key: 'hex' | ColorChannel): string =>
  key === 'hex'
    ? spell(
        { ...panelColor.value, a: alphaOn.value ? panelColor.value.a : 255 },
        'hex',
      )
    : channelText(panelColor.value, key);

// Typed text commits on Enter or blur; text that is no number reverts, and
// either way the input then shows what the value spells.
const onChannelCommit = (key: 'hex' | ColorChannel, event: Event) => {
  const input = event.target as HTMLInputElement;

  if (input.value === channelValue(key)) return;

  const c =
    key === 'hex'
      ? readColor(input.value, alphaOn.value)
      : readChannel(panelColor.value, key, input.value);

  if (c) pick(c);

  nextTick(() => {
    input.value = channelValue(key);
  });
};

const onChannelKeyDown = (key: 'hex' | ColorChannel, event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    onChannelCommit(key, event);

    return;
  }

  if (key === 'hex') return;

  if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;

  event.preventDefault();

  const input = event.target as HTMLInputElement;

  pick(
    nudgeChannel(
      panelColor.value,
      key,
      event.key === 'ArrowUp' ? 1 : -1,
      event.shiftKey,
    ),
  );
  nextTick(() => {
    input.value = channelValue(key);
  });
};

// ---- the swatch grid -----------------------------------------------------------

const selectedSwatch = computed(() => {
  const c = chosenColor.value;

  return c ? swatchList.value.findIndex((s) => sameColor(s.color, c)) : -1;
});

// The grid's roving Tab stop.
const swatchFocus = ref(0);

const swatchEls = () =>
  Array.from(
    swatchesRef.value?.querySelectorAll<HTMLElement>('[role="option"]') ?? [],
  );

const focusSwatch = (i: number) => {
  swatchFocus.value = i;
  nextTick(() => swatchEls()[i]?.focus(focusOptions()));
};

const pickSwatch = (i: number) => {
  const swatch = swatchList.value[i];

  if (!swatch) return;

  swatchFocus.value = i;

  // Swatch-only follows c-select in every layout: a pick commits and closes.
  if (swatchesOnly.value) {
    if (!sameColor(swatch.color, committedColor.value))
      typed.commitValue({
        end: null,
        start: spell(swatch.color, notation.value),
      });

    closePanel(true);

    return;
  }

  pick(swatch.color);
};

const onSwatchKeyDown = (i: number, event: KeyboardEvent) => {
  const els = swatchEls();

  // Columns, counted from the rendered rows: the fullscreen grid is wider.
  const columns = Math.max(
    1,
    els.filter((el) => el.offsetTop === els[0]?.offsetTop).length,
  );

  const last = els.length - 1;

  let target: null | number = null;

  switch (event.key) {
    case ' ':
      event.preventDefault();
      pickSwatch(i);

      return;
    case 'ArrowDown':
      target = i + columns <= last ? i + columns : i;
      break;
    case 'ArrowLeft':
      target = Math.max(0, i - 1);
      break;
    case 'ArrowRight':
      target = Math.min(last, i + 1);
      break;
    case 'ArrowUp':
      target = i - columns >= 0 ? i - columns : i;
      break;
    case 'End':
      target = last;
      break;
    case 'Enter':
      event.preventDefault();
      pickSwatch(i);

      // The fullscreen panel's Enter selects and then acts as Done (ADR-0066).
      if (confirming.value) pickDone();

      return;
    case 'Home':
      target = 0;
      break;
    default:
      return;
  }

  event.preventDefault();
  focusSwatch(target);
};

// ---- the Done button (ADR-0066) -----------------------------------------------

// Commits the pending colour — nothing when there was no pick — and closes.
// It commits before closing: the panel's layout resets as it closes.
const pickDone = () => {
  const c = pendingColor.value;

  if (c && !sameColor(c, committedColor.value))
    typed.commitValue({ end: null, start: spell(c, notation.value) });

  closePanel(true);
};

// ---- the panel ---------------------------------------------------------------

const onPanelKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    event.preventDefault();
    event.stopPropagation();
    closePanel(true);

    return;
  }

  // The focus trap (ADR-0058): Tab cycles inside the card.
  if (event.key !== 'Tab' || !cardRef.value) return;

  const stops = Array.from(
    cardRef.value.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [tabindex="0"]',
    ),
  ).filter(
    (el) =>
      // The area's hidden ranges are clipped, never display:none.
      (el.getClientRects().length > 0 || el.dataset.axis !== undefined) &&
      !el.closest('[inert]'),
  );

  if (!stops.length) return;

  const root = cardRef.value.getRootNode();

  const active =
    root instanceof ShadowRoot ? root.activeElement : document.activeElement;

  const index = stops.indexOf(active as HTMLElement);

  const nextIndex = event.shiftKey
    ? index <= 0
      ? stops.length - 1
      : index - 1
    : index === stops.length - 1
      ? 0
      : index + 1;

  event.preventDefault();
  stops[nextIndex].focus(focusOptions());
};

const narrow = useNarrowViewport();

// Swatch-only binds its own field box; the typed field binds through
// TypedField.vue. One anchored panel serves both.
type TemplateRefValue = ComponentPublicInstance | Element | null;

const bindAnchor = (el: TemplateRefValue) => {
  typed.anchor.value = el as HTMLElement | null;
};

const bindField = (el: TemplateRefValue) => {
  typed.field.value = el as HTMLElement | null;
};

const {
  anchorStyle,
  cardStyle,
  close: closePanel,
  isOpen,
  layout,
  onToggle,
  open: openAnchoredPanel,
  panelStyle,
} = useAnchoredPanel({
  anchor: typed.anchor,
  disabled: () => props.disabled,
  field: typed.field,
  fullscreen: narrow,
  host,
  matchWidth: false,
  // A pending colour leaves nothing behind on any exit but Done.
  onClosed: () => {
    pendingColor.value = null;
    dragPointer = null;
  },
  onOpened: () => {
    pendingColor.value = null;
    view.value = notation.value;
    hsv.value = toHsv(panelColor.value, hsv.value);
    swatchFocus.value = Math.max(0, selectedSwatch.value);
    nextTick(() =>
      requestAnimationFrame(() => {
        const grid = swatchesRef.value;

        if (grid && layout.value === 'anchored')
          applyPeekCap(grid, { rows: swatchEls() });
        else if (grid) grid.style.maxHeight = '';

        const target = swatchesOnly.value
          ? swatchEls()[swatchFocus.value]
          : areaInput(areaAxis.value);

        target?.focus(focusOptions({ preventScroll: true }));
      }),
    );
  },
  panel: panelRef,
  returnFocusTo: () =>
    swatchesOnly.value ? comboRef.value : typed.startInput.value,
});

// Every open takes the original first; an open request while open keeps it.
const openPanel = () => {
  if (!isOpen.value)
    originalColor.value = swatchesOnly.value ? null : committedColor.value;

  openAnchoredPanel();
};

// The fullscreen panel collects picks for its Done button (ADR-0066); a
// swatch-only pick commits and closes in every layout.
const confirming = computed(
  () => layout.value === 'fullscreen' && !swatchesOnly.value,
);

const ui = computed(() =>
  colorPicker({ fullscreen: layout.value === 'fullscreen' }),
);

const togglePanel = () => {
  if (isOpen.value) {
    closePanel(true);

    return;
  }

  openPanel();
};

const onColorButtonClick = (event: Event) => {
  event.stopPropagation();

  if (!isOpen.value) typed.commitAll();

  togglePanel();
};

// ---- the swatch-only field ----------------------------------------------------

const onFieldClick = () => {
  if (!props.disabled && !isOpen.value) openPanel();
};

const onChevronClick = (event: Event) => {
  event.stopPropagation();
  togglePanel();
};

const onComboKeyDown = (event: KeyboardEvent) => {
  if (
    event.key === 'Enter' ||
    event.key === ' ' ||
    event.key === 'ArrowDown' ||
    event.key === 'ArrowUp'
  ) {
    event.preventDefault();
    openPanel();
  }
};

const onSwatchClear = (event: Event) => {
  typed.onClear(event);
  comboRef.value?.focus();
};

defineExpose({ badInput });
</script>

<!--
  Escape-hatch CSS: only constructs Tailwind utilities cannot express.
    - `:host{display:block}` — the field is a real box.
    - `[part='panel'] position-try-fallbacks` and the two `@position-try`
      rules — `useAnchoredPanel`'s per-shadow-root half, identical in every
      consumer (c-autocomplete, c-tree-select, c-date-picker, c-time-picker).
    - the popover open animation keyframe, off under reduced motion.
    - `::placeholder` and the range pseudo-elements — native pseudo-elements.
    - the picker's own paint: the area, hue and alpha gradients, the
      checkerboard and the thumbs. These are colour data, not theme roles:
      a hue track is red at 0° in either theme mode, and the checkerboard is
      the fixed light greys transparency is conventionally shown on.
-->
<style>
:host {
  display: block;

  --_c-color-picker-checker: repeating-conic-gradient(
      #d4d4d4 0% 25%,
      #fff 0% 50%
    )
    0 0 / 8px 8px;
}

@position-try --c-field-panel-above {
  position-area: top span-right;
  margin-top: 0;
  margin-bottom: calc(-1 * var(--_c-field-panel-top-offset, 0px));
}

@position-try --c-field-panel-above-left {
  position-area: top span-left;
  margin-top: 0;
  margin-bottom: calc(-1 * var(--_c-field-panel-top-offset, 0px));
}

[part='panel'] {
  position-try-fallbacks:
    --c-field-panel-above, flip-inline, --c-field-panel-above-left;
}

[part='panel']:popover-open {
  animation: c-color-picker-fade-in 0.12s ease-out;
}

.c-typed-field__input::placeholder {
  color: var(--c-on-surface-faint);
  opacity: 1;
}

/* A chip: the colour over the checkerboard, so transparency shows. */
.c-color-picker__chip {
  background:
    linear-gradient(
      var(--_c-color-picker-color, transparent),
      var(--_c-color-picker-color, transparent)
    ),
    var(--_c-color-picker-checker);
}

/* No colour: a slash across the field's own ground. */
.c-color-picker__chip--empty {
  background: linear-gradient(
    to top right,
    transparent calc(50% - 1px),
    var(--c-on-surface-muted) calc(50% - 1px) calc(50% + 1px),
    transparent calc(50% + 1px)
  );
}

.c-color-picker__area {
  background:
    linear-gradient(to top, #000, transparent),
    linear-gradient(to right, #fff, transparent),
    hsl(var(--_c-color-picker-hue, 0) 100% 50%);
}

.c-color-picker__area:has(input:focus-visible) .c-color-picker__thumb {
  outline: 2px solid var(--c-primary);
  outline-offset: 2px;
}

/* A thumb reads on every colour: a white ring inside a dark hairline. */
.c-color-picker__thumb {
  background: var(--_c-color-picker-opaque, transparent);
  box-shadow:
    0 0 0 2px #fff,
    0 0 0 3px rgb(0 0 0 / 0.4),
    inset 0 0 0 1px rgb(0 0 0 / 0.2);
}

.c-color-picker__range::-webkit-slider-runnable-track {
  height: 12px;
  border-radius: 9999px;
}

.c-color-picker__range::-moz-range-track {
  height: 12px;
  border-radius: 9999px;
}

.c-color-picker__hue::-webkit-slider-runnable-track {
  background: linear-gradient(
    to right,
    #f00 0%,
    #ff0 16.67%,
    #0f0 33.33%,
    #0ff 50%,
    #00f 66.67%,
    #f0f 83.33%,
    #f00 100%
  );
}

.c-color-picker__hue::-moz-range-track {
  background: linear-gradient(
    to right,
    #f00 0%,
    #ff0 16.67%,
    #0f0 33.33%,
    #0ff 50%,
    #00f 66.67%,
    #f0f 83.33%,
    #f00 100%
  );
}

.c-color-picker__alpha::-webkit-slider-runnable-track {
  background:
    linear-gradient(to right, transparent, var(--_c-color-picker-opaque, #000)),
    var(--_c-color-picker-checker);
}

.c-color-picker__alpha::-moz-range-track {
  background:
    linear-gradient(to right, transparent, var(--_c-color-picker-opaque, #000)),
    var(--_c-color-picker-checker);
}

.c-color-picker__range::-webkit-slider-thumb {
  appearance: none;
  width: 16px;
  height: 16px;
  margin-top: -2px;
  border-radius: 9999px;
  background: transparent;
  box-shadow:
    0 0 0 2px #fff,
    0 0 0 3px rgb(0 0 0 / 0.4);
}

.c-color-picker__range::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border: 0;
  border-radius: 9999px;
  background: transparent;
  box-shadow:
    0 0 0 2px #fff,
    0 0 0 3px rgb(0 0 0 / 0.4);
}

@keyframes c-color-picker-fade-in {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Reduced motion (ADR-0057): the panel opens in place instead of dropping in. */
@media (prefers-reduced-motion: reduce) {
  [part='panel']:popover-open {
    animation: none;
  }
}
</style>
