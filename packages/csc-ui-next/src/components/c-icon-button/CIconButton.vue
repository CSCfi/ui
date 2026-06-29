<template>
  <button :class="ui.root()" :disabled part="root" @click="onClick">
    <div ref="containerRef" :class="ui.inner()" part="content">
      <span
        v-if="loading"
        :class="ui.spinner()"
        :style="{ width: `${spinnerSize}px`, height: `${spinnerSize}px` }"
      />

      <template v-else>
        <slot>
          <svg v-if="path" height="24" viewBox="0 0 24 24" width="24">
            <path :d="path" fill="currentColor" />
          </svg>
        </slot>
      </template>
    </div>

    <span
      v-if="badge !== null && badge !== ''"
      :class="ui.badge()"
      part="badge"
    >
      {{ badge }}
    </span>

    <span :class="ui.ripples()" aria-hidden="true">
      <span
        v-for="r in ripples"
        :key="r.id"
        :class="ui.ripple()"
        :style="r.style"
      />
    </span>
  </button>
</template>

<script setup lang="ts">
import { tv } from 'tailwind-variants';
import { computed, useTemplateRef } from 'vue';

import { useRipple } from '../../shared/useRipple';

/**
 * Styling lives entirely in this `tailwind-variants` config (ADR-0004): the
 * old per-component `--_c-icon-button-*` override-variable layer is dropped and
 * authored directly against the design tokens; `variants`/`compoundVariants`
 * replace the original `:host([…])` selector cascade. Customization is via
 * `::part()` (ADR-0006); there is no `override` prop.
 *
 * The box lives on the inner `<button>` (`part="root"`); the host stays
 * `display:contents`.
 *
 * COLOUR CONTRACT (shared primitive): the icon colour is driven by
 * `currentColor` — each appearance variant sets a `text-*` utility on `root`,
 * and the slotted `<svg>`/path uses `fill="currentColor"`. A PARENT (c-tag,
 * c-table, …) can recolour the icon by setting the `color` property on the
 * element; the removed `--c-icon-button-text-color` / `--c-icon-button-*`
 * override vars are NOT reintroduced.
 *
 * SIZE CONTRACT: driven by the `size` prop (`small` / `x-small` → smaller box
 * via the `size` variant); the inline spinner uses `spinnerSize` (px).
 *
 * Hover utilities are unguarded because the disabled variant sets
 * `pointer-events-none`, so a disabled button never receives :hover.
 */
const iconButton = tv({
  compoundVariants: [
    // ---- default (no appearance flag) -----------------------------------
    {
      class: {
        root: 'bg-primary-600 text-white hover:bg-primary-400 focus-visible:outline-primary-600',
      },
      danger: false,
      ghost: false,
      inverted: false,
      outlined: false,
      text: false,
    },
    {
      class: {
        root: 'bg-white text-primary-600 hover:bg-primary-200 focus-visible:outline-primary-600',
      },
      danger: false,
      ghost: false,
      inverted: true,
      outlined: false,
      text: false,
    },
    // ---- danger ----------------------------------------------------------
    {
      class: {
        root: 'bg-error-600 text-white hover:bg-error-400 focus-visible:outline-primary-600',
      },
      danger: true,
    },
    // ---- ghost -----------------------------------------------------------
    {
      class: {
        root: 'bg-primary-600/20 text-primary-600 hover:bg-primary-600/30 focus-visible:outline-primary-600',
      },
      ghost: true,
      inverted: false,
    },
    {
      class: {
        root: 'bg-white/20 text-white hover:bg-white/30 focus-visible:outline-primary-600',
      },
      ghost: true,
      inverted: true,
    },
    // ---- text ------------------------------------------------------------
    {
      class: {
        root: 'bg-transparent text-primary-600 hover:bg-primary-100 focus-visible:outline-primary-600',
      },
      inverted: false,
      text: true,
    },
    {
      class: {
        root: 'bg-transparent text-white hover:bg-white/20 focus-visible:outline-primary-600',
      },
      inverted: true,
      text: true,
    },
    // ---- outlined --------------------------------------------------------
    {
      class: {
        root: 'bg-transparent text-primary-600 ring-2 ring-inset ring-primary-600 hover:bg-primary-600/10 focus-visible:outline-primary-600',
      },
      inverted: false,
      outlined: true,
    },
    {
      class: {
        root: 'bg-transparent text-white ring-2 ring-inset ring-white hover:bg-white/20 focus-visible:outline-primary-600',
      },
      inverted: true,
      outlined: true,
    },
    // ---- disabled (overrides appearance bg/text/border) ------------------
    // Ordered LAST so these win over the appearance compounds above (tv merges
    // compoundVariants in source order; last-matching wins). One per appearance,
    // mirroring c-button's disabled palette.
    {
      class: { root: 'bg-tertiary-100 text-tertiary-600' },
      danger: false,
      disabled: true,
      ghost: false,
      inverted: false,
      outlined: false,
      text: false,
    },
    {
      class: { root: 'bg-tertiary-100 text-tertiary-500' },
      danger: false,
      disabled: true,
      ghost: false,
      inverted: true,
      outlined: false,
      text: false,
    },
    {
      class: { root: 'bg-tertiary-100 text-tertiary-600' },
      danger: true,
      disabled: true,
    },
    {
      class: { root: 'bg-tertiary-100 text-tertiary-600' },
      disabled: true,
      ghost: true,
      inverted: false,
    },
    {
      class: { root: 'bg-white/5 text-tertiary-400' },
      disabled: true,
      ghost: true,
      inverted: true,
    },
    {
      class: { root: 'bg-transparent text-tertiary-400' },
      disabled: true,
      text: true,
    },
    {
      class: {
        root: 'bg-transparent text-tertiary-500 ring-2 ring-inset ring-tertiary-400',
      },
      disabled: true,
      inverted: false,
      outlined: true,
    },
    {
      class: {
        root: 'bg-transparent text-tertiary-400 ring-2 ring-inset ring-tertiary-400',
      },
      disabled: true,
      inverted: true,
      outlined: true,
    },
  ],
  defaultVariants: {
    danger: false,
    disabled: false,
    ghost: false,
    inverted: false,
    outlined: false,
    size: 'default',
    text: false,
  },
  slots: {
    badge:
      'absolute -top-1 -right-1 z-[2] min-w-[18px] h-[18px] px-1 inline-flex items-center justify-center rounded-full border-2 border-white bg-warning-600 text-white text-[11px] leading-[14px] font-semibold pointer-events-none',
    inner:
      'relative flex items-center justify-center size-full inset-0 overflow-hidden transform-gpu',
    ripple:
      'absolute rounded-full bg-current pointer-events-none transition-[transform,opacity] duration-[600ms] ease-out',
    ripples:
      'absolute inset-0 overflow-hidden pointer-events-none rounded-[inherit]',
    // Box + default appearance live here; appearance flags refine in
    // compoundVariants so the inverted/disabled intersections override cleanly.
    root: 'relative inline-grid place-items-center size-10 p-0 m-0 border-0 appearance-none cursor-pointer rounded-full overflow-visible [font-family:var(--c-font-family)] leading-normal transition-colors duration-300 ease-[cubic-bezier(0.25,0.8,0.5,1)] outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid',
    spinner:
      'inline-block border-2 border-solid border-current border-r-transparent rounded-full animate-spin',
  },
  variants: {
    danger: { true: '' },
    // Only non-colour utilities here; the disabled COLOURS live in
    // compoundVariants ordered last, so they override the appearance compounds
    // (which are merged after plain variants and would otherwise win). Mirrors
    // c-button.
    disabled: {
      true: {
        root: 'pointer-events-none cursor-default',
      },
    },
    ghost: { true: '' },
    // Appearance flags: base look set in compoundVariants below.
    inverted: { true: '' },
    loading: {
      true: {
        root: 'pointer-events-none cursor-default',
      },
    },
    outlined: { true: '' },
    size: {
      default: { root: 'size-10' },
      small: { root: 'size-8' },
      'x-small': { root: 'size-7' },
    },
    text: { true: '' },
  },
});

interface CIconButtonProps {
  badge?: null | number | string;
  danger?: boolean;
  disabled?: boolean;
  ghost?: boolean;
  inverted?: boolean;
  loading?: boolean;
  outlined?: boolean;
  path?: string;
  size?: string;
  text?: boolean;
}

const props = withDefaults(defineProps<CIconButtonProps>(), {
  badge: null,
  danger: false,
  disabled: false,
  ghost: false,
  inverted: false,
  loading: false,
  outlined: false,
  path: '',
  size: 'default',
  text: false,
});

const ui = computed(() =>
  iconButton({
    danger: props.danger,
    disabled: props.disabled,
    ghost: props.ghost,
    inverted: props.inverted,
    loading: props.loading,
    outlined: props.outlined,
    size: props.size as 'default' | 'small' | 'x-small',
    text: props.text,
  }),
);

const containerRef = useTemplateRef<HTMLElement>('containerRef');

const spinnerSize = computed(() => {
  if (props.size === 'x-small') return 18;

  if (props.size === 'small') return 20;

  return 24;
});

// Material-style click ripple (shared logic in useRipple). The `ripple` tv
// slot carries the transition utilities that tween each <span>.
const { ripples, spawn: spawnRipple } = useRipple({
  container: () => containerRef.value,
});

const onClick = (event: MouseEvent) => {
  if (props.disabled || props.loading) {
    event.preventDefault();
    event.stopPropagation();

    return;
  }

  spawnRipple(event);
};
</script>

<!--
  Escape-hatch CSS (ADR-0007): constructs Tailwind utilities cannot express.
  - ::slotted(svg|i|span) — sizing consumer-provided light-DOM icon children
    (a slotted `<c-icon>` sizes itself via its own `size` prop and inherits
    colour via `currentColor`, so it needs no rule here).
  All static / variant styling lives in the `tv` config above; the ripple is
  driven by the shared useRipple composable + transition utilities (ADR-0004).
-->
<style>
::slotted(svg),
::slotted(i),
::slotted(span) {
  width: 24px;
  height: 24px;
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

:host([size='small']) ::slotted(svg),
:host([size='small']) ::slotted(i),
:host([size='small']) ::slotted(span) {
  width: 22px;
  height: 22px;
  font-size: 16px;
}

:host([size='x-small']) ::slotted(svg),
:host([size='x-small']) ::slotted(i),
:host([size='x-small']) ::slotted(span) {
  width: 18px;
  height: 18px;
  font-size: 14px;
}

::slotted(*) {
  pointer-events: none;
}
</style>
