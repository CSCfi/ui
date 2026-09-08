<template>
  <span :class="ui.root()" aria-hidden="true" part="indicator">
    <svg
      v-if="checked || indeterminate"
      :class="ui.mark()"
      part="mark"
      viewBox="0 0 100 100"
    >
      <path v-if="indeterminate" :class="ui.path()" d="M20 56 h60 v-8 h-60 z" />

      <path
        v-else
        :class="ui.path()"
        d="M 12 52 l 24 24 l 47 -47 l -3 -3 l -44 44 l -21 -21 l -3 3"
      />
    </svg>
  </span>
</template>

<script setup lang="ts">
/**
 * Internal shared checkbox indicator: the 18px bordered box (the `indicator`
 * part) and the check / indeterminate glyph revealed inside it (the `mark`
 * part). NOT a registered custom element — imported into a host component's
 * template and rendered inside its shadow root, so the stamped parts join
 * that component's `::part()` contract (the analyzer merges them; ADR-0044).
 *
 * Two kinds of host render it: `c-checkbox`, where it IS the control's visual
 * and the host's hidden native input drives the state, and the option rows of
 * `c-dropdown` / `c-autocomplete` in `multiple` mode, where it is a purely
 * decorative mirror of `aria-selected` (hence `aria-hidden`; the row is the
 * interactive target, never this box). State is prop-driven here so both
 * hosts fill it the same way.
 *
 * ONE colour channel (ADR-0039): `text-*` sets `currentColor`, and the border,
 * the checked fill and the optional focus halo all draw from it, so a consumer
 * `color` on `::part(indicator)` recolours the three together; the glyph draws
 * with its own `currentColor` (`::part(mark)`). Placement is the host's job —
 * the base carries no position utility; pass `absolute …` or `relative` via
 * the fallthrough `class`.
 *
 * No `<style>` block on purpose: a non-element SFC has no shadow root of its
 * own to adopt a per-type sheet into, so even the SVG stroke geometry is
 * authored as arbitrary-property utilities. Semantic-token utilities only.
 */
import { tv } from 'tailwind-variants';
import { computed } from 'vue';

const indicator = tv({
  compoundVariants: [
    // Error recolours the channel (border, fill, halo follow) unless disabled,
    // where the disabled grey wins for the box; the mark recolours regardless.
    { class: { root: 'text-error' }, disabled: false, error: true },
  ],
  defaultVariants: {
    checked: false,
    disabled: false,
    error: false,
    focusHalo: false,
    indeterminate: false,
  },
  slots: {
    // The glyph: fills the box's 14px padding box (18px minus the 2px border).
    mark: 'absolute inset-0 h-[14px] w-[14px] text-on-primary',
    path: 'fill-current stroke-current [stroke-width:13] [stroke-linecap:round] [stroke-linejoin:round] [stroke-miterlimit:10]',
    root: 'block shrink-0 h-[18px] w-[18px] rounded-csc-sm border-2 border-current bg-transparent text-primary transition-[color,background-color,border-color] duration-200 ease-out',
  },
  variants: {
    checked: { true: { root: 'bg-current' } },
    disabled: { true: { root: 'text-border-strong' } },
    error: { true: { mark: 'text-on-error' } },
    // The keyboard focus ring: a 44px circular halo drawn by the box's own
    // `::before` (the -15px inset is measured from the padding box inside the
    // 2px border), hidden until the host reveals it on `:focus-visible`. Only
    // a real control (c-checkbox) renders it — in a list row the invisible
    // pseudo would add scrollable overflow.
    focusHalo: {
      true: {
        root: "before:content-[''] before:pointer-events-none before:absolute before:-inset-[15px] before:rounded-full before:border-2 before:border-current before:opacity-0",
      },
    },
    indeterminate: { true: { path: 'stroke-transparent', root: 'bg-current' } },
  },
});

interface SelectionIndicatorProps {
  /** Fill the box and show the check glyph. */
  checked?: boolean;
  /** Paint the disabled colour channel. */
  disabled?: boolean;
  /** Paint the error colour channel (box unless disabled; mark always). */
  error?: boolean;
  /** Render the keyboard focus halo pseudo-element for the host to reveal. */
  focusHalo?: boolean;
  /** Fill the box and show the indeterminate bar (wins over `checked`). */
  indeterminate?: boolean;
}

const props = withDefaults(defineProps<SelectionIndicatorProps>(), {
  checked: false,
  disabled: false,
  error: false,
  focusHalo: false,
  indeterminate: false,
});

const ui = computed(() =>
  indicator({
    checked: props.checked,
    disabled: props.disabled,
    error: props.error,
    focusHalo: props.focusHalo,
    indeterminate: props.indeterminate,
  }),
);
</script>
