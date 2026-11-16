<template>
  <svg
    :class="ui.root()"
    :role="$attrs['aria-label'] ? 'img' : undefined"
    :style="{ width: iconSize, height: iconSize }"
    part="root"
    viewBox="0 0 24 24"
  >
    <path :d="path" :style="{ fill: pathFill }" />
  </svg>
</template>

<script setup lang="ts">
/**
 * @csspart root - The `<svg>` element rendering the icon
 */
import { tv } from 'tailwind-variants';
import { computed } from 'vue';

/**
 * Styling lives in this `tailwind-variants` config. The host is
 * `display:contents` globally, so the SVG is the `root` element and carries the
 * `inline-flex` box. The old `--c-icon-*` / `--_c-icon-*` indirection variables
 * are dropped: size and colour are dynamic props with arbitrary
 * values, so they're applied directly as inline styles on the SVG / path rather
 * than enumerable `tv` variants. Consumer customization is via `::part()`.
 *
 * COLOUR OVERRIDE HOOK: the path fill is `var(--_c-icon-color, <color prop>)`,
 * so the `color` prop is the default but an ANCESTOR library component can
 * recolour a slotted icon by setting the private `--_c-icon-color` (it
 * inherits across the shadow boundary; not a consumer hook, ADR-0006). This is
 * needed because the `color` prop lands as the path's own inline declaration,
 * which inherited `color`/`currentColor` cannot override — e.g. a disabled
 * c-list-item greying a `<c-icon color="...">`. Default fallback is
 * `currentColor`, so icons without a `color` still follow the inherited colour
 * (no behavioural change when `--_c-icon-color` is unset).
 *
 * SIZE OVERRIDE HOOK: likewise the size is `var(--_c-icon-size, <size prop>)`,
 * so an ancestor library component that fixes its icon box sizes a slotted
 * icon to fit it, whatever its `size` says (c-status's marker, ADR-0087).
 */
const icon = tv({
  slots: {
    root: 'inline-flex items-center',
  },
});

interface CIconProps {
  /**
   * Fill color.
   *
   * @freeform any CSS color value
   */
  color?: string;

  /**
   * Svg `path` `d` attribute value.
   *
   * @freeform SVG path data
   */
  path: string;

  /** Icon size in pixels. */
  size?: number;
}

const props = withDefaults(defineProps<CIconProps>(), {
  color: 'currentColor',
  size: 24,
});

const ui = computed(() => icon());

// `size` is the fallback; an ancestor's `--_c-icon-size` wins, as the colour
// hook does.
const iconSize = computed(() => `var(--_c-icon-size, ${props.size}px)`);

// `color` is the fallback; an ancestor's `--_c-icon-color` (inherited across the
// shadow boundary) wins — see the COLOUR OVERRIDE HOOK note above.
const pathFill = computed(() => `var(--_c-icon-color, ${props.color})`);
</script>
