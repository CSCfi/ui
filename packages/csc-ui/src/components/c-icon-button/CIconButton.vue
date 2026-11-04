<template>
  <button
    :aria-busy="loading ? 'true' : undefined"
    :aria-disabled="loading ? 'true' : undefined"
    :class="ui.root()"
    :disabled
    part="root"
    @click="onClick"
  >
    <div ref="containerRef" :class="ui.inner()" part="content">
      <span
        v-if="loading"
        :class="ui.spinner()"
        :style="{ width: `${spinnerSize}px`, height: `${spinnerSize}px` }"
      />

      <!-- While loading the content stays, hidden visually only: slotted
           text that names the button must not go with it. -->
      <span :class="loading ? 'sr-only' : 'contents'">
        <slot>
          <svg v-if="path" height="24" viewBox="0 0 24 24" width="24">
            <path :d="path" fill="currentColor" />
          </svg>
        </slot>
      </span>
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
/**
 * How strongly an icon button reads: `filled` for the main action, then
 * `outlined`, `ghost` and `text`, each lighter than the last — `c-button`'s
 * appearances.
 */
export type CIconButtonAppearance = 'filled' | 'ghost' | 'outlined' | 'text';

/**
 * Size of the icon button. `small` and `x-small` render progressively more
 * compact buttons; omitting the attribute renders the default size.
 */
export type CIconButtonSize = 'default' | 'small' | 'x-small';

/**
 * The colour an icon button takes — `c-button`'s variants: `primary` (unless
 * set) and `secondary`, the brand families, or a status colour — `success`,
 * `info`, `warning` and `danger`, a destructive action in the error colour.
 */
export type CIconButtonVariant =
  | 'danger'
  | 'info'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning';

interface CIconButtonProps {
  /**
   * The button's look: `filled` (unless set) for the main action; `outlined`
   * (a primary outline, no fill), `ghost` (a light primary tint) or `text`
   * (no fill or outline) for lower emphasis.
   */
  appearance?: CIconButtonAppearance;

  /**
   * Count shown in a bubble at the button's top-right corner; hidden while
   * `null` or empty, so `0` still shows.
   */
  badge?: null | number | string;

  /**
   * Danger look for a destructive action: the error colour.
   *
   * @deprecated Use `variant="danger"`.
   */
  danger?: boolean;

  /**
   * Disable the button: it leaves the Tab order and ignores the pointer.
   */
  disabled?: boolean;

  /**
   * Ghost appearance: a light primary tint, for lower emphasis.
   *
   * @deprecated Use `appearance="ghost"`.
   */
  ghost?: boolean;

  /**
   * Inverted colours for a fixed dark or brand-coloured backdrop: the
   * `inverse-*` family, the same in both theme modes. Combines with every
   * appearance.
   */
  inverted?: boolean;

  /**
   * Show a spinner in place of the icon and ignore clicks; the button stays
   * focusable and is announced as busy and unavailable.
   */
  loading?: boolean;

  /**
   * Outlined appearance: a primary outline with no fill, for lower emphasis.
   *
   * @deprecated Use `appearance="outlined"`.
   */
  outlined?: boolean;

  /**
   * Icon path of an icon the button draws itself, always 24px; a slotted icon
   * wins over it.
   *
   * @freeform SVG path data
   */
  path?: string;

  /**
   * Size of the button: `default` (40px), `small` (32px) or `x-small` (28px).
   */
  size?: CIconButtonSize;

  /**
   * Text appearance: no fill or outline, the lightest look.
   *
   * @deprecated Use `appearance="text"`.
   */
  text?: boolean;

  /**
   * The button's colour, in every appearance: `primary` unless set (or
   * changed app-wide), `secondary`, `success`, `info`, `warning`, or `danger`
   * for a destructive action.
   *
   * @defaultable 'primary'
   */
  variant?: CIconButtonVariant;
}
</script>

<script setup lang="ts">
/**
 * @slot default - The icon: a `c-icon` or an `<svg>`; it wins over `path`
 *
 * @csspart root - The native `<button>` element carrying the visual styling
 * @csspart content - Inner wrapper around the slotted icon or loading spinner
 * @csspart badge - The count bubble at the button's top-right corner, shown by `badge`
 */
import { tv } from 'tailwind-variants';
import { computed, useTemplateRef } from 'vue';

import { useAppDefault } from '../../shared/appDefaults';
import { resolveAppearance } from '../../shared/buttonAppearance';
import { dangerAsVariant } from '../../shared/buttonVariant';
import { useIdReferences } from '../../shared/useIdReferences';
import { useRipple } from '../../shared/useRipple';

/**
 * Styling lives entirely in this `tailwind-variants` config: the
 * old per-component `--_c-icon-button-*` override-variable layer is dropped and
 * authored directly against the design tokens; `variants`/`compoundVariants`
 * replace the original `:host([…])` selector cascade. Customization is via
 * `::part()`; there is no `override` prop.
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
// keeps the map complete against the public union.
const sizeVariants = {
  default: { root: 'size-10' },
  small: { root: 'size-8' },
  'x-small': { root: 'size-7' },
} satisfies Record<CIconButtonSize, object>;

// The variant's colours as private custom properties on `root`, which the
// appearance compounds below paint with — c-button's scheme (ADR-0079):
// `fill`, `fill-hover` and `on-fill` paint the filled look, tint the lighter
// ones and border the outlined one; `ink` is the icon of the lighter
// appearances (the role's subtle ink); `inverse` is the icon of the inverted
// filled look. Hoisted so the runtime guard below can test membership.
const variantVariants = {
  danger: {
    root: '[--_c-icon-button-fill-hover:var(--c-error-hover)] [--_c-icon-button-fill:var(--c-error)] [--_c-icon-button-ink:var(--c-on-error-subtle)] [--_c-icon-button-inverse:var(--c-inverse-error)] [--_c-icon-button-on-fill:var(--c-on-error)]',
  },
  info: {
    root: '[--_c-icon-button-fill-hover:var(--c-info-hover)] [--_c-icon-button-fill:var(--c-info)] [--_c-icon-button-ink:var(--c-on-info-subtle)] [--_c-icon-button-inverse:var(--c-inverse-info)] [--_c-icon-button-on-fill:var(--c-on-info)]',
  },
  primary: {
    root: '[--_c-icon-button-fill-hover:var(--c-primary-hover)] [--_c-icon-button-fill:var(--c-primary)] [--_c-icon-button-ink:var(--c-on-primary-subtle)] [--_c-icon-button-inverse:var(--c-inverse-primary)] [--_c-icon-button-on-fill:var(--c-on-primary)]',
  },
  secondary: {
    root: '[--_c-icon-button-fill-hover:var(--c-secondary-hover)] [--_c-icon-button-fill:var(--c-secondary)] [--_c-icon-button-ink:var(--c-on-secondary-subtle)] [--_c-icon-button-inverse:var(--c-inverse-secondary)] [--_c-icon-button-on-fill:var(--c-on-secondary)]',
  },
  success: {
    root: '[--_c-icon-button-fill-hover:var(--c-success-hover)] [--_c-icon-button-fill:var(--c-success)] [--_c-icon-button-ink:var(--c-on-success-subtle)] [--_c-icon-button-inverse:var(--c-inverse-success)] [--_c-icon-button-on-fill:var(--c-on-success)]',
  },
  warning: {
    root: '[--_c-icon-button-fill-hover:var(--c-warning-hover)] [--_c-icon-button-fill:var(--c-warning)] [--_c-icon-button-ink:var(--c-on-warning-subtle)] [--_c-icon-button-inverse:var(--c-inverse-warning)] [--_c-icon-button-on-fill:var(--c-on-warning)]',
  },
} satisfies Record<CIconButtonVariant, object>;

const iconButton = tv({
  compoundVariants: [
    // ---- default (filled) --------------------------------------------------
    {
      class: {
        root: 'bg-(--_c-icon-button-fill) text-(--_c-icon-button-on-fill) hover:bg-(--_c-icon-button-fill-hover) focus-visible:outline-(--_c-icon-button-fill)',
      },
      ghost: false,
      inverted: false,
      outlined: false,
      text: false,
    },
    {
      class: {
        root: 'bg-inverse-surface text-(--_c-icon-button-inverse) hover:bg-(--_c-icon-button-inverse)/15 focus-visible:outline-inverse-on',
      },
      ghost: false,
      inverted: true,
      outlined: false,
      text: false,
    },
    // ---- ghost -----------------------------------------------------------
    {
      class: {
        root: 'bg-(--_c-icon-button-fill)/14 text-(--_c-icon-button-ink) hover:bg-(--_c-icon-button-fill)/20 focus-visible:outline-(--_c-icon-button-ink)',
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
        root: 'bg-transparent text-(--_c-icon-button-ink) hover:bg-(--_c-icon-button-fill)/20 focus-visible:outline-(--_c-icon-button-ink)',
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
        root: 'bg-transparent text-(--_c-icon-button-ink) ring-2 ring-(--_c-icon-button-fill) ring-inset hover:bg-(--_c-icon-button-fill)/20 focus-visible:outline-(--_c-icon-button-ink)',
      },
      inverted: false,
      outlined: true,
    },
    {
      class: {
        root: 'bg-transparent text-inverse-on ring-2 ring-inverse-on ring-inset hover:bg-inverse-on/30 focus-visible:outline-inverse-on',
      },
      inverted: true,
      outlined: true,
    },
    // ---- disabled (overrides appearance bg/text/border) ------------------
    // Ordered LAST so these win over the appearance compounds above (tv merges
    // compoundVariants in source order; last-matching wins). One per appearance,
    // mirroring c-button's disabled palette, one neutral look for every
    // variant: the disabled ink, not the muted or faint hint inks, which AA
    // contrast keeps dark enough to read as enabled.
    {
      class: { root: 'bg-surface-muted text-on-surface-disabled' },
      disabled: true,
      ghost: false,
      inverted: false,
      outlined: false,
      text: false,
    },
    {
      class: { root: 'bg-inverse-on/10 text-inverse-on/40' },
      disabled: true,
      ghost: false,
      inverted: true,
      outlined: false,
      text: false,
    },
    {
      class: { root: 'bg-surface-muted text-on-surface-disabled' },
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
      class: { root: 'bg-transparent text-on-surface-disabled' },
      disabled: true,
      text: true,
    },
    {
      class: {
        root: 'bg-transparent text-on-surface-disabled ring-2 ring-border ring-inset',
      },
      disabled: true,
      inverted: false,
      outlined: true,
    },
    {
      class: {
        root: 'bg-transparent text-inverse-on/40 ring-2 ring-inverse-on/40 ring-inset',
      },
      disabled: true,
      inverted: true,
      outlined: true,
    },
  ],
  defaultVariants: {
    disabled: false,
    ghost: false,
    inverted: false,
    outlined: false,
    size: 'default',
    text: false,
    variant: 'primary',
  },
  slots: {
    badge:
      'pointer-events-none absolute -top-1 -right-1 z-[2] inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-surface bg-warning px-1 text-[11px] leading-[14px] font-semibold text-on-warning',
    inner:
      'relative inset-0 flex size-full transform-gpu items-center justify-center',
    ripple:
      'pointer-events-none absolute rounded-full bg-current transition-[transform,opacity] duration-[600ms] ease-out',
    ripples:
      'pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]',
    // Box + default appearance live here; appearance flags refine in
    // compoundVariants so the inverted/disabled intersections override cleanly.
    root: 'relative m-0 inline-grid size-10 cursor-pointer appearance-none place-items-center overflow-visible rounded-full border-0 p-0 leading-normal transition-colors duration-300 ease-[cubic-bezier(0.25,0.8,0.5,1)] outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid',
    spinner:
      'inline-block animate-spin rounded-full border-2 border-solid border-current border-r-transparent',
  },
  variants: {
    // Only non-colour utilities here; the disabled COLOURS live in
    // compoundVariants ordered last, so they override the appearance compounds
    // (which are merged after plain variants and would otherwise win). Mirrors
    // c-button.
    disabled: {
      true: {
        root: 'pointer-events-none cursor-default',
      },
    },
    // Appearance flags, one per non-filled appearance (resolved from the
    // `appearance` prop below): base look set in compoundVariants above.
    ghost: { true: '' },
    inverted: { true: '' },
    loading: {
      true: {
        root: 'pointer-events-none cursor-default',
      },
    },
    outlined: { true: '' },
    size: sizeVariants,
    text: { true: '' },
    variant: variantVariants,
  },
});

const props = withDefaults(defineProps<CIconButtonProps>(), {
  // Unset, so the deprecated booleans still choose until 5.0.
  appearance: undefined,
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
  // Unset, so an app default or the deprecated `danger` can choose.
  variant: undefined,
});

const appearance = computed(() => resolveAppearance(props));

// Defaultable props resolve host attribute → own property → app default →
// built-in (see src/shared/appDefaults.ts). The variant reads the element's
// own `variant`, then its deprecated `danger`, before the app default.
const appDefault = useAppDefault('c-icon-button', props);

const variantResolved = appDefault(
  'variant',
  'primary',
  'danger',
  dangerAsVariant,
);

// Attributes can deliver any string at runtime; unknown values fall back to
// the defaults.
const ui = computed(() =>
  iconButton({
    disabled: props.disabled,
    ghost: appearance.value === 'ghost',
    inverted: props.inverted,
    loading: props.loading,
    outlined: appearance.value === 'outlined',
    size: props.size in sizeVariants ? props.size : 'default',
    text: appearance.value === 'text',
    variant:
      variantResolved.value in variantVariants
        ? variantResolved.value
        : 'primary',
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

// The page's id references on the element reach the element carrying its role.
useIdReferences('[part~="root"]');
</script>

<!--
  Escape-hatch CSS: constructs Tailwind utilities cannot express.
  - ::slotted(svg|i|span) — sizing consumer-provided light-DOM icon children
    (a slotted `<c-icon>` sizes itself via its own `size` prop and inherits
    colour via `currentColor`, so it needs no rule here).
  All static / variant styling lives in the `tv` config above; the ripple is
  driven by the shared useRipple composable + transition utilities.
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
