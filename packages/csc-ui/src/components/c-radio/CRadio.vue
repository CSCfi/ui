<template>
  <label :class="ui.root()" part="root">
    <input
      ref="inputRef"
      :class="ui.input()"
      :disabled="isDisabled"
      type="radio"
      @change="onChange"
    />

    <span ref="surfaceRef" :class="ui.surface()" class="c-radio__indicator">
      <span :class="ui.rippleLayer()" aria-hidden="true">
        <span
          v-for="r in ripples"
          :key="r.id"
          :class="ui.rippleEffect()"
          :style="r.style"
        />
      </span>

      <span
        :class="ui.indicator()"
        class="c-radio__selection"
        part="indicator"
      />
    </span>

    <span :class="ui.content()" part="content"><slot /></span>
  </label>
</template>

<script setup lang="ts">
/**
 * @slot default - The radio's label content, rendered inside the shadow `<label>` so it stays click-associated and announced
 *
 * @csspart root - The `<label>` row wrapping the input, indicator and label content
 * @csspart indicator - The radio ring itself; the selection dot is its `::after` and the keyboard focus ring its `::before` — all three follow `currentColor`, so `color` recolours the whole indicator, focus ring included
 * @csspart content - Wrapper around the slotted label content
 *
 * @cssstate checked - Present while the radio is the selected option (standalone or group-driven)
 * @cssstate disabled - Present while the radio is disabled, by its own prop or by its group
 */
import { tv } from 'tailwind-variants';
import { computed, useTemplateRef, watch } from 'vue';

import { coerceBoolean } from '../../shared/coerceBoolean';
import { useHostEmit } from '../../shared/useHostEmit';
import { useHostStates } from '../../shared/useHostStates';
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
 * Each radio's ring is the `indicator` slot (the `indicator` part, ring via
 * `box-shadow`), the filled dot is its `::after` pseudo and the keyboard focus
 * ring its `::before` halo (ADR-0039). The checked and disabled states are
 * republished on the host via `ElementInternals` so consumers get per-state
 * `::part()` styling (`c-radio:state(checked)::part(indicator)`, ADR-0035).
 * The dot's SELECTED state (`input:checked ~ … .selection::after
 * { transform: scale(1) }`), the hover tint, the focus-ring reveal, and the
 * disabled dimming are all driven by the live state of the sibling `<input>`
 * and so cannot be `tv` variants — they live in the escape-hatch `<style>`
 * below. The STATIC dot and halo looks (`after:` / `before:` size, position,
 * resting state) are authored here in `tv`.
 *
 * Colour resolves through the internal `--_c-radio-color` custom property so
 * a parent `<c-radio-group>` can recolour slotted radios (error/disabled)
 * across the shadow boundary by inheritance; standalone it falls back to the
 * primary role.
 */
const radio = tv({
  slots: {
    content: 'pt-3 text-left',
    // The radio ring (the `indicator` part): 20x20 ring (box-shadow inset)
    // with the selection dot as a hidden `::after` and the keyboard focus ring
    // as a hidden `::before` halo (46px outer / 42px inner — the former outline
    // on the 42px surface); both are revealed by sibling-driven escape-hatch
    // rules (:checked / :focus-visible). Ring, dot and halo all follow
    // `currentColor`, so a consumer `color` on `::part(indicator)` recolours
    // the whole indicator, focus ring included (ADR-0039). Resting dot state
    // uses `after:[transform:scale(0)]` (NOT `after:scale-0`, which sets the
    // separate CSS `scale` property and would survive the escape-hatch
    // `transform: scale(1)`, pinning the dot permanently invisible).
    indicator:
      "absolute top-[11px] left-[11px] h-5 w-5 bg-transparent rounded-full shadow-[inset_0_0_0_2px_currentColor] transition-shadow duration-150 ease-in-out before:content-[''] before:pointer-events-none before:absolute before:-inset-[13px] before:rounded-full before:border-2 before:border-current before:opacity-0 after:content-[''] after:absolute after:top-[5px] after:left-[5px] after:h-2.5 after:w-2.5 after:rounded-full after:bg-current after:[transform:scale(0)] after:transition-transform after:duration-150 after:ease-in-out",
    // Visually hidden but keyboard/screen-reader accessible — standard pattern
    // for hiding the underlying native radio.
    input:
      'absolute h-px w-px overflow-hidden border-0 p-0 [clip:rect(1px,1px,1px,1px)]',
    // Material click ripple: an absolutely-positioned circle, always centred
    // in the 42px surface (clipped by the `rippleLayer`). Tweens scale/opacity
    // via the `transition` util (no bespoke @keyframes). `bg-current` so it
    // follows the surface's state colour.
    rippleEffect:
      'pointer-events-none absolute rounded-full bg-current transition-[transform,opacity] duration-[600ms] ease-out',
    // Clips the ripple to the circle so the indicator's focus halo (which
    // overhangs the surface by 2px) is not clipped with it.
    rippleLayer:
      'pointer-events-none absolute inset-0 rounded-full overflow-hidden',
    root: 'flex items-start relative cursor-pointer text-base select-none gap-1 leading-[1.2]',
    // 42px circular ripple surface around the radio ring. Purely internal (no
    // part). Colour comes from the escape-hatch `--_c-radio-color` rule (a
    // var() fallback chain is not a utility). Does NOT clip: the indicator's
    // focus halo overhangs it by 2px; clipping is the `rippleLayer`'s job.
    surface:
      'inline-block relative h-[42px] w-[42px] min-w-[42px] rounded-full transition-colors duration-200 ease-in-out',
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

const surfaceRef = useTemplateRef<HTMLElement>('surfaceRef');

const inputRef = useTemplateRef<HTMLInputElement>('inputRef');

// Material-style ripple, always centred in the 42px surface (the change event
// carries no pointer coordinates). `sizeFactor: 1` keeps it inside the fixed
// circular surface; the `rippleLayer` clips it there.
const { ripples, spawn: spawnRipple } = useRipple({
  container: () => surfaceRef.value,
  sizeFactor: 1,
});

// Republish checked/disabled as host custom states so consumers can write
// per-state ::part() rules: c-radio:state(checked)::part(indicator). Both
// live on the inner input (where a parent group writes them imperatively),
// so they are synced from every write path: the prop watch below, the user
// change handler, and the group's `_syncGroupState` calls.
const setState = useHostStates();

watch(isDisabled, (on) => setState('disabled', on), { immediate: true });

// Group-driven state sync — INTERNAL contract with <c-radio-group>, not
// public API (the `_` prefix keeps it out of the manifest). The group owns
// exclusivity, combined disabling and the roving tabindex; this hook lets the
// radio mirror those writes onto its input AND its host custom states, so the
// group never reaches into this shadow root. NEVER emits (programmatic
// writes are not user interaction).
const _syncGroupState = (state: {
  checked: boolean;
  disabled: boolean;
  tabIndex: number;
}) => {
  const input = inputRef.value;

  if (!input) return;
  input.checked = state.checked;
  input.disabled = state.disabled;
  input.tabIndex = state.tabIndex;
  setState('checked', state.checked);
  setState('disabled', state.disabled);
};

defineExpose({ _syncGroupState });

// The inner input fires native `change` only on genuine user interaction —
// never on the programmatic writes a parent <c-radio-group> makes via
// `_syncGroupState` while coordinating the group — so re-dispatching here
// upholds the library's emit-only-on-interaction rule structurally. Checked
// state is NOT tracked here: a grouped radio is driven by the group; a
// standalone one keeps the input's own native state (and can only ever be
// selected, so `checked` is set, never cleared, outside a group).
const onChange = () => {
  spawnRipple();
  setState('checked', true);
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
    and the focus-ring reveal `input:focus-visible ~ … ::before` — all depend
    on the live `:checked`/`:focus-visible` of the SIBLING input, which `tv`
    variants cannot observe. The static dot and halo looks are in `tv`; the
    halo sits on the indicator part so it draws with the indicator's colour
    (ADR-0039).
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

/* Focus-visible: reveal the indicator's `before:` halo (geometry and colour
 * are tv-authored; it draws with the indicator's currentColor, which inherits
 * the surface's colour chain above). */
input:focus-visible ~ .c-radio__indicator .c-radio__selection::before {
  opacity: 1;
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
