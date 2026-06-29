<template>
  <svg
    :class="ui.root()"
    :style="{ width: iconSize, height: iconSize }"
    part="root"
    viewBox="0 0 24 24"
  >
    <path :d="path" :style="{ fill: pathFill }" />
  </svg>
</template>

<script setup lang="ts">
import { tv } from 'tailwind-variants';
import { computed } from 'vue';

/**
 * Styling lives in this `tailwind-variants` config (ADR-0004). The host is
 * `display:contents` globally, so the SVG is the `root` element and carries the
 * `inline-flex` box. The old `--c-icon-*` / `--_c-icon-*` indirection variables
 * are dropped (ADR-0004): size and colour are dynamic props with arbitrary
 * values, so they're applied directly as inline styles on the SVG / path rather
 * than enumerable `tv` variants. Consumer customization is via `::part()`
 * (ADR-0006).
 *
 * COLOUR OVERRIDE HOOK: the path fill is `var(--c-icon-color, <color prop>)`,
 * so the `color` prop is the default but an ANCESTOR can recolour a slotted icon
 * by setting `--c-icon-color` (it inherits across the shadow boundary). This is
 * needed because the `color` prop lands as the path's own inline declaration,
 * which inherited `color`/`currentColor` cannot override — e.g. a disabled
 * c-list-item greying a `<c-icon color="...">`. Default fallback is
 * `currentColor`, so icons without a `color` still follow the inherited colour
 * (no behavioural change when `--c-icon-color` is unset).
 */
const icon = tv({
  slots: {
    root: 'inline-flex items-center',
  },
});

interface CIconProps {
  /** Fill color. */
  color?: string;
  /** Svg `path` `d` attribute value. */
  path: string;
  /** Icon size in pixels. */
  size?: number;
}

const props = withDefaults(defineProps<CIconProps>(), {
  color: 'currentColor',
  size: 24,
});

const ui = computed(() => icon());

const iconSize = computed(() => `${props.size}px`);

// `color` is the fallback; an ancestor's `--c-icon-color` (inherited across the
// shadow boundary) wins — see the COLOUR OVERRIDE HOOK note above.
const pathFill = computed(() => `var(--c-icon-color, ${props.color})`);
</script>
