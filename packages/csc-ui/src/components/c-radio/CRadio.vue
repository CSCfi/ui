<template>
  <label :class="ui.root()" part="root">
    <input
      :class="ui.input()"
      :disabled="isDisabled"
      type="radio"
      @change="onChange"
    />

    <span
      ref="indicatorRef"
      :class="ui.indicator()"
      class="c-radio__indicator"
      part="indicator"
    >
      <span
        v-for="r in ripples"
        :key="r.id"
        :class="ui.rippleEffect()"
        :style="r.style"
        aria-hidden="true"
      />

      <span :class="ui.selection()" class="c-radio__selection" />
    </span>

    <span :class="ui.content()" part="content"><slot /></span>
  </label>
</template>

<script setup lang="ts">
/**
 * @slot default - The radio's label content, rendered inside the shadow `<label>` so it stays click-associated and announced
 *
 * @csspart root - The `<label>` row wrapping the input, indicator and label content
 * @csspart indicator - The circular ripple surface holding the radio ring and dot
 * @csspart content - Wrapper around the slotted label content
 */
import { tv } from 'tailwind-variants';
import { computed, useTemplateRef } from 'vue';

import { coerceBoolean } from '../../shared/coerceBoolean';
import { useHostEmit } from '../../shared/useHostEmit';
import { useRipple } from '../../shared/useRipple';

// The shadow <label> is this component's root part; consumer fallthrough
// attrs (class/style) must stay on the host instead of leaking onto it and
// colliding with the tv utilities.
defineOptions({ inheritAttrs: false });

/** Events dispatched by `<c-radio>`. */
interface CRadioEvents {
  /**
   * Fired when the radio is selected by the user, carrying its `value`.
   * Bubbles composed so the parent `<c-radio-group>` — whose shadow root a
   * light-DOM event never enters — catches it on its host; a consumer
   * listening on the group hears it too, with the radio as `target`.
   */
  change: string;
}

/**
 * Styling lives in this `tailwind-variants` config; customization is via
 * `::part()`.
 *
 * Each radio's ring is a `.c-radio__selection` box (ring via `box-shadow`) and
 * the filled dot is its `::after` pseudo. The dot's SELECTED state
 * (`input:checked ~ … .selection::after { transform: scale(1) }`), the hover
 * tint, the focus-visible outline, and the disabled dimming are all driven by
 * the live state of the sibling `<input>` and so cannot be `tv` variants —
 * they live in the escape-hatch `<style>` below. The STATIC dot look
 * (`after:` size/position/scale-0/transition) is authored here in `tv`.
 *
 * Colour resolves through the internal `--_c-radio-color` custom property so
 * a parent `<c-radio-group>` can recolour slotted radios (error/disabled)
 * across the shadow boundary by inheritance; standalone it falls back to the
 * primary role.
 */
const radio = tv({
  slots: {
    content: 'pt-3 text-left',
    // 42px circular ripple surface around the radio ring. Colour comes from
    // the escape-hatch `--_c-radio-color` rule (a var() fallback chain is not
    // a utility).
    indicator:
      'inline-block relative h-[42px] w-[42px] min-w-[42px] rounded-full overflow-hidden transition-colors duration-200 ease-in-out',
    // Visually hidden but keyboard/screen-reader accessible — standard pattern
    // for hiding the underlying native radio.
    input:
      'absolute h-px w-px overflow-hidden border-0 p-0 [clip:rect(1px,1px,1px,1px)]',
    // Material click ripple: an absolutely-positioned circle, always centred
    // in the 42px surface (which clips via overflow-hidden + rounded-full).
    // Tweens scale/opacity via the `transition` util (no bespoke @keyframes).
    // `bg-current` so it follows the indicator's state colour.
    rippleEffect:
      'pointer-events-none absolute rounded-full bg-current transition-[transform,opacity] duration-[600ms] ease-out',
    root: 'flex items-start relative cursor-pointer text-base select-none gap-1 leading-[1.2]',
    // 20x20 ring (box-shadow inset) with a hidden dot `::after`; the dot is
    // revealed by the sibling-driven escape-hatch rule on :checked.
    // Resting state uses `after:[transform:scale(0)]` (NOT `after:scale-0`,
    // which sets the separate CSS `scale` property and would survive the
    // escape-hatch `transform: scale(1)`, pinning the dot permanently invisible).
    selection:
      "absolute top-[11px] left-[11px] h-5 w-5 bg-transparent rounded-full shadow-[inset_0_0_0_2px_currentColor] transition-shadow duration-150 ease-in-out after:content-[''] after:absolute after:top-[5px] after:left-[5px] after:h-2.5 after:w-2.5 after:rounded-full after:bg-current after:[transform:scale(0)] after:transition-transform after:duration-150 after:ease-in-out",
  },
});

interface CRadioProps {
  /**
   * Disable the radio button
   */
  disabled?: boolean;
  /**
   * Radio button value
   *
   * @freeform
   */
  value?: string;
}

const props = withDefaults(defineProps<CRadioProps>(), {
  disabled: false,
  value: '',
});

const ui = radio();

// Boolean attribute presence can reach a declared Boolean prop as the raw
// string "" (falsy) — coerce before it drives the input's disabled state.
const isDisabled = computed(() => coerceBoolean(props.disabled));

const emit = useHostEmit<CRadioEvents>();

const indicatorRef = useTemplateRef<HTMLElement>('indicatorRef');

// Material-style ripple, always centred in the 42px surface (the change event
// carries no pointer coordinates). `sizeFactor: 1` keeps it inside the fixed
// circular surface.
const { ripples, spawn: spawnRipple } = useRipple({
  container: () => indicatorRef.value,
  sizeFactor: 1,
});

// The inner input fires native `change` only on genuine user interaction —
// never on the programmatic `.checked` writes a parent <c-radio-group> makes
// while coordinating the group — so re-dispatching here upholds the library's
// emit-only-on-interaction rule structurally. Checked state is NOT tracked
// here: a grouped radio is driven by the group; a standalone one keeps the
// input's own native state.
const onChange = () => {
  spawnRipple();
  emit('change', props.value, { bubbles: true, composed: true });
};
</script>

<!--
  Escape-hatch CSS: only constructs Tailwind utilities cannot
  express. Everything static lives in the `tv` config above. What remains:

  - `:host{display:block;width:fit-content}` — restores a box on the host (the
    global sheet sets `:host{display:contents}`) so bare radios stack sanely
    and consumer layout wrappers can flex/measure them.
  - The indicator colour chain `var(--_c-radio-color, var(--c-primary))` — a
    var() fallback is not expressible as a semantic utility; the custom
    property inherits from a parent <c-radio-group> across the shadow boundary.
  - The sibling-driven dot reveal `input:checked ~ … ::after`, the hover tint,
    and the focus-visible outline — all depend on the live
    `:checked`/`:focus-visible` of the SIBLING input, which `tv` variants
    cannot observe. The static dot look is in `tv`.
  - The disabled dimming, driven by the input's live `:disabled` (which a
    parent group sets imperatively for group-level disabling) via `:has()` —
    also unreachable by `tv` variants.
  Tokens only.
-->
<style>
:host {
  display: block;
  width: fit-content;
}

.c-radio__indicator {
  color: var(--_c-radio-color, var(--c-primary));
}

/* Selected: reveal the filled dot. Sibling-input selector. */
input:checked ~ .c-radio__indicator .c-radio__selection::after {
  transform: scale(1);
}

/* Hover tint on the indicator (skipped when disabled). */
label:not(:has(input:disabled)):hover .c-radio__indicator {
  background-color: color-mix(
    in srgb,
    var(--_c-radio-color, var(--c-primary)) 10%,
    transparent
  );
}

input:focus {
  outline: none;
}

input:focus-visible ~ .c-radio__indicator {
  outline: 2px solid var(--_c-radio-color, var(--c-primary));
}

/* Disabled: dim the WHOLE row — ring/dot AND label content — and drop the
 * pointer cursor. Keyed on the input's live :disabled (not the prop) so a
 * group-level disable, written imperatively by the parent, dims too. The
 * indicator needs its own colour override because the group's error recolour
 * rides in on the same custom property. */
label:has(input:disabled) {
  color: var(--c-on-surface-muted);
  cursor: default;
  opacity: 0.75;
}

label:has(input:disabled) .c-radio__indicator {
  color: var(--c-on-surface-muted);
}
</style>
