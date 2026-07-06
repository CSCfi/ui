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

<script lang="ts">
export interface CIconButtonProps {
  /**
   * Show a badge on top of the icon
   *
   * @seeded from csc-ui — verify
   */
  badge?: null | number | string;
  /**
   * Danger variant of the button
   *
   * @seeded from csc-ui — verify
   */
  danger?: boolean;
  /**
   * Disable the button
   *
   * @seeded from csc-ui — verify
   */
  disabled?: boolean;
  /**
   * Ghost variant of the button
   *
   * @seeded from csc-ui — verify
   */
  ghost?: boolean;
  /**
   * Inverted color for dark backgrounds
   *
   * @seeded from csc-ui — verify
   */
  inverted?: boolean;
  /**
   * Loading variant of the button
   *
   * @seeded from csc-ui — verify
   */
  loading?: boolean;
  /**
   * Outlined variant of the button
   *
   * @seeded from csc-ui — verify
   */
  outlined?: boolean;
  /**
   * Path for the svg icon
   *
   * @seeded from csc-ui — verify
   * @freeform SVG path data
   */
  path?: string;
  /**
   * Size of the button
   *
   * @seeded from csc-ui — verify
   */
  size?: CIconButtonSize;
  /**
   * Text variant of the button
   *
   * @seeded from csc-ui — verify
   */
  text?: boolean;
}

/**
 * Size of the icon button. `small` and `x-small` render progressively more
 * compact buttons; omitting the attribute renders the default size.
 */
export type CIconButtonSize = 'default' | 'small' | 'x-small';
</script>

<script setup lang="ts">
/**
 * @slot default - Default slot for the icon
 *
 * @csspart root - The native `<button>` element carrying the visual styling
 * @csspart content - Inner wrapper around the slotted icon or loading spinner
 * @csspart badge - The badge bubble shown in the button's corner
 *
 * @seeded from csc-ui — verify
 */
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
// Hoisted so the runtime guard below can test membership; the `satisfies`
// keeps the map complete against the public union (ADR-0015).
const sizeVariants = {
  default: { root: 'size-10' },
  small: { root: 'size-8' },
  'x-small': { root: 'size-7' },
} satisfies Record<CIconButtonSize, object>;

const iconButton = tv({
  compoundVariants: [
    // ---- default (no appearance flag) -----------------------------------
    {
      class: {
        root: 'bg-primary text-on-primary hover:bg-primary-hover focus-visible:outline-primary',
      },
      danger: false,
      ghost: false,
      inverted: false,
      outlined: false,
      text: false,
    },
    {
      class: {
        root: 'bg-inverse-surface text-inverse-primary hover:bg-inverse-primary/15 focus-visible:outline-inverse-on',
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
        root: 'bg-error text-on-error hover:bg-error-hover focus-visible:outline-error',
      },
      danger: true,
    },
    // ---- ghost -----------------------------------------------------------
    {
      class: {
        root: 'bg-primary-subtle text-primary hover:bg-primary-subtle-hover focus-visible:outline-primary',
      },
      ghost: true,
      inverted: false,
    },
    {
      class: {
        root: 'bg-inverse-on/20 text-inverse-on hover:bg-inverse-on/30 focus-visible:outline-inverse-on',
      },
      ghost: true,
      inverted: true,
    },
    // ---- text ------------------------------------------------------------
    {
      class: {
        root: 'bg-transparent text-primary hover:bg-primary-subtle-hover focus-visible:outline-primary',
      },
      inverted: false,
      text: true,
    },
    {
      class: {
        root: 'bg-transparent text-inverse-on hover:bg-inverse-on/30 focus-visible:outline-inverse-on',
      },
      inverted: true,
      text: true,
    },
    // ---- outlined --------------------------------------------------------
    {
      class: {
        root: 'bg-transparent text-primary ring-2 ring-inset ring-primary hover:bg-primary-subtle focus-visible:outline-primary',
      },
      inverted: false,
      outlined: true,
    },
    {
      class: {
        root: 'bg-transparent text-inverse-on ring-2 ring-inset ring-inverse-on hover:bg-inverse-on/30 focus-visible:outline-inverse-on',
      },
      inverted: true,
      outlined: true,
    },
    // ---- disabled (overrides appearance bg/text/border) ------------------
    // Ordered LAST so these win over the appearance compounds above (tv merges
    // compoundVariants in source order; last-matching wins). One per appearance,
    // mirroring c-button's disabled palette.
    {
      class: { root: 'bg-surface-muted text-on-surface-muted' },
      danger: false,
      disabled: true,
      ghost: false,
      inverted: false,
      outlined: false,
      text: false,
    },
    {
      class: { root: 'bg-inverse-on/10 text-inverse-on/40' },
      danger: false,
      disabled: true,
      ghost: false,
      inverted: true,
      outlined: false,
      text: false,
    },
    {
      class: { root: 'bg-surface-muted text-on-surface-muted' },
      danger: true,
      disabled: true,
    },
    {
      class: { root: 'bg-surface-muted text-on-surface-muted' },
      disabled: true,
      ghost: true,
      inverted: false,
    },
    {
      class: { root: 'bg-inverse-on/10 text-inverse-on/40' },
      disabled: true,
      ghost: true,
      inverted: true,
    },
    {
      class: { root: 'bg-transparent text-on-surface-muted' },
      disabled: true,
      text: true,
    },
    {
      class: {
        root: 'bg-transparent text-on-surface-muted ring-2 ring-inset ring-border',
      },
      disabled: true,
      inverted: false,
      outlined: true,
    },
    {
      class: {
        root: 'bg-transparent text-inverse-on/40 ring-2 ring-inset ring-inverse-on/40',
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
      'absolute -top-1 -right-1 z-[2] min-w-[18px] h-[18px] px-1 inline-flex items-center justify-center rounded-full border-2 border-surface bg-warning text-on-warning text-[11px] leading-[14px] font-semibold pointer-events-none',
    inner:
      'relative flex items-center justify-center size-full inset-0 transform-gpu',
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
    size: sizeVariants,
    text: { true: '' },
  },
});

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

// Attributes can deliver any string at runtime; unknown values fall back to
// the default size (ADR-0015).
const ui = computed(() =>
  iconButton({
    danger: props.danger,
    disabled: props.disabled,
    ghost: props.ghost,
    inverted: props.inverted,
    loading: props.loading,
    outlined: props.outlined,
    size: props.size in sizeVariants ? props.size : 'default',
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
