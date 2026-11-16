<template>
  <div ref="rootRef" :class="ui.root()" part="root">
    <!-- One marker element, kept in the tree so the icon slot is assigned and
         reports `slotchange` whatever the marker. -->
    <span
      v-show="shape !== 'none'"
      :class="ui.marker()"
      aria-hidden="true"
      part="marker"
    >
      <slot :class="ui.iconSlot()" name="icon" />

      <template v-if="shape === 'icon' && !hasIcon">
        <svg v-if="icon" :class="ui.glyph()" viewBox="0 0 24 24">
          <path :d="icon" />
        </svg>

        <span v-else :class="ui.haloDot()" />
      </template>
    </span>

    <slot />
  </div>
</template>

<script lang="ts">
/**
 * How the pill reads: `filled` paints the status tint, `outlined` keeps the
 * ground and colours only the marker.
 */
export type CStatusAppearance = 'filled' | 'outlined';

/**
 * The symbol before the text: the status icon on a tinted halo, a dot in the
 * status colour, or none.
 */
export type CStatusMarker = 'dot' | 'icon' | 'none';

/** Size of the pill: 20px `small`, 24px `default` or 32px `large`. */
export type CStatusSize = 'default' | 'large' | 'small';

/**
 * Status type of the pill. Each value paints the matching semantic status
 * colours; omitting the attribute renders the neutral grey pill.
 */
export type CStatusType = 'error' | 'info' | 'success' | 'warning';

interface CStatusProps {
  /**
   * `filled` (unless set, or changed app-wide) paints the status tint;
   * `outlined` keeps the ground behind the pill and colours only the marker.
   *
   * @defaultable 'filled'
   */
  appearance?: CStatusAppearance;

  /**
   * The symbol before the text: `icon` (the status icon on a tinted halo),
   * `dot`, or `none` (unless set, or changed app-wide). A slotted icon
   * replaces it.
   *
   * @defaultable 'none'
   */
  marker?: CStatusMarker;

  /**
   * Size of the pill: `small`, `default` (unless set, or changed app-wide)
   * or `large`.
   *
   * @defaultable 'default'
   */
  size?: CStatusSize;

  /**
   * The status family whose tint and ink paint the pill; without it the
   * pill is neutral grey.
   */
  type?: CStatusType;
}
</script>

<script setup lang="ts">
/**
 * @slot default - The status text, such as Active or Failed
 * @slot icon - An icon, such as a `c-icon`, that replaces the marker
 *
 * @csspart root - The status pill wrapping the marker and the slotted text
 * @csspart marker - The marker before the text: the icon's halo, or the dot
 */
import { tv } from 'tailwind-variants';
import { computed, useTemplateRef } from 'vue';

import { useAppDefault } from '../../shared/appDefaults';
import { STATUS_ICONS } from '../../shared/statusIcons';
import { useHasSlot } from '../../shared/useHasSlot';

/**
 * Styling lives entirely in this `tailwind-variants` config (ADR-0087). The
 * `type` sets three private colours on `root` that every appearance and
 * marker reads: `--_c-status-fill` (the status `*-subtle` tint),
 * `--_c-status-ink` (its `on-*-subtle` ink) and `--_c-status-role` (the
 * status fill colour; `on-surface-muted` for the neutral pill).
 *
 * Filled paints the tint with its ink, edged by the role mixed 40% into the
 * tint. Outlined keeps the ground, inks the text `on-surface` and edges it
 * with a translucent muted hairline that reads on every surface.
 *
 * The icon marker is c-toast's badge at pill scale: the icon in the ink on a
 * halo of the role at 20%, opaque (`bg-tint-*`, ADR-0082). A filled pill makes
 * its tint the halo's ground; an outlined one leaves the ground its container
 * set. A slotted icon sits in the same halo, sized to the pill. The dot takes
 * the role colour itself: it is decoration, the text names the state.
 * Consumer customization is via `::part()`.
 */
const typeVariants = {
  error: {
    root: '[--_c-status-fill:var(--c-error-subtle)] [--_c-status-ink:var(--c-on-error-subtle)] [--_c-status-role:var(--c-error)]',
  },
  info: {
    root: '[--_c-status-fill:var(--c-info-subtle)] [--_c-status-ink:var(--c-on-info-subtle)] [--_c-status-role:var(--c-info)]',
  },
  success: {
    root: '[--_c-status-fill:var(--c-success-subtle)] [--_c-status-ink:var(--c-on-success-subtle)] [--_c-status-role:var(--c-success)]',
  },
  warning: {
    root: '[--_c-status-fill:var(--c-warning-subtle)] [--_c-status-ink:var(--c-on-warning-subtle)] [--_c-status-role:var(--c-warning)]',
  },
} satisfies Record<CStatusType, object>;

const appearanceVariants = {
  filled: {
    root: 'border-[color-mix(in_srgb,var(--_c-status-role)_40%,var(--_c-status-fill))] bg-(--_c-status-fill) text-(--_c-status-ink) [--_c-tint-ground:var(--_c-status-fill)] [--_c-tint-scale:1]',
  },
  outlined: {
    root: 'border-on-surface-muted/40 bg-transparent text-on-surface',
  },
} satisfies Record<CStatusAppearance, object>;

// `--_c-icon-size` is the icon size in the halo: the status glyph reads it, and
// so does a slotted `c-icon` (its size hook) or a plain `<svg>` or `<img>`.
const sizeVariants = {
  default: {
    haloDot: 'size-1.5',
    marker: '[--_c-icon-size:14px]',
    root: 'min-h-6 gap-1.5 px-2 text-sm/none',
  },
  large: {
    haloDot: 'size-2',
    marker: '[--_c-icon-size:18px]',
    root: 'min-h-8 gap-2 px-3 text-base/none',
  },
  small: {
    haloDot: 'size-[5px]',
    marker: '[--_c-icon-size:11px]',
    root: 'min-h-5 gap-1 px-1.5 text-xs/none',
  },
} satisfies Record<CStatusSize, object>;

/** What the marker element draws: a halo (status or slotted icon), a dot or nothing. */
type CStatusShape = 'dot' | 'icon' | 'none';

// The marker's box per shape and size: the halo, or the dot itself.
const markerBoxes: Record<
  Exclude<CStatusShape, 'none'>,
  Record<CStatusSize, string>
> = {
  dot: { default: 'size-2', large: 'size-2.5', small: 'size-1.5' },
  icon: { default: 'size-[18px]', large: 'size-6', small: 'size-3.5' },
};

const status = tv({
  compoundVariants: (['dot', 'icon'] as const).flatMap((shape) =>
    (['default', 'large', 'small'] as const).map((size) => ({
      class: { marker: markerBoxes[shape][size] },
      shape,
      size,
    })),
  ),
  defaultVariants: {
    appearance: 'filled',
    shape: 'none',
    size: 'default',
    type: '',
  },
  slots: {
    glyph: 'size-(--_c-icon-size) shrink-0 fill-current',
    haloDot: 'rounded-full bg-current',
    iconSlot:
      '[&::slotted(img)]:size-(--_c-icon-size) [&::slotted(svg)]:size-(--_c-icon-size) [&::slotted(svg)]:fill-current',
    marker: 'shrink-0 rounded-full',
    root: 'box-border inline-flex items-center rounded-csc-md border py-0.5 font-medium [--_c-status-fill:var(--c-surface-muted)] [--_c-status-ink:var(--c-on-surface-muted)] [--_c-status-role:var(--c-on-surface-muted)]',
  },
  variants: {
    appearance: appearanceVariants,
    shape: {
      dot: { marker: 'bg-current text-(--_c-status-role)' },
      icon: {
        marker:
          'grid place-items-center bg-tint-(--_c-status-role)/20 text-(--_c-status-ink)',
      },
      none: {},
    } satisfies Record<CStatusShape, object>,
    size: sizeVariants,
    type: {
      '': '',
      ...typeVariants,
    },
  },
});

const props = withDefaults(defineProps<CStatusProps>(), {
  // Unset, so an app default can choose.
  appearance: undefined,
  marker: undefined,
  size: undefined,
  type: undefined,
});

// Defaultable props resolve host attribute → own property → app default →
// built-in (see src/shared/appDefaults.ts).
const appDefault = useAppDefault('c-status', props);

const appearanceResolved = appDefault('appearance', 'filled');

const markerResolved = appDefault('marker', 'none');

const sizeResolved = appDefault('size', 'default');

const MARKERS: ReadonlySet<string> = new Set(['dot', 'icon', 'none']);

const rootRef = useTemplateRef<HTMLElement>('rootRef');

const hasIcon = useHasSlot(rootRef, 'icon');

// Attributes can deliver any string at runtime; unknown values fall back to
// the built-ins, and an unknown type to the neutral pill.
const type = computed(() =>
  props.type && props.type in typeVariants ? props.type : '',
);

// A slotted icon is the marker, whatever `marker` says.
const shape = computed((): CStatusShape => {
  if (hasIcon.value) return 'icon';

  return MARKERS.has(markerResolved.value) ? markerResolved.value : 'none';
});

// The neutral pill has no status icon: its halo holds a dot instead.
const icon = computed(() => (type.value ? STATUS_ICONS[type.value] : ''));

const ui = computed(() =>
  status({
    appearance:
      appearanceResolved.value in appearanceVariants
        ? appearanceResolved.value
        : 'filled',
    shape: shape.value,
    size: sizeResolved.value in sizeVariants ? sizeResolved.value : 'default',
    type: type.value,
  }),
);
</script>
