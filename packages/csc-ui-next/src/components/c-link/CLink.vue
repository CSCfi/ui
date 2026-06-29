<template>
  <div>
    <a
      :class="ui.root()"
      v-bind="{
        ...(!!href ? { href } : {}),
        ...(!!target ? { target } : {}),
      }"
      :style="{ fontWeight: String(weight) }"
      part="root"
    >
      <slot />
    </a>
  </div>
</template>

<script setup lang="ts">
import { tv } from 'tailwind-variants';
import { computed } from 'vue';

/**
 * Styling lives entirely in this `tailwind-variants` config (ADR-0004): the
 * old `--_c-link-*` indirection layer is dropped and authored directly against
 * the design tokens. Customization is via `::part(root)` (ADR-0006). The host
 * stays `display:contents`; the real box is the inner `a` (`part="root"`).
 *
 * Colour: `text-info-700` (was `--c-link-color` fallback `--c-info-700`); the
 * hover background reproduces the original `--c-accent-200` swap.
 */
const link = tv({
  defaultVariants: {
    underline: false,
  },
  slots: {
    root: 'inline-flex items-center justify-start gap-2 bg-transparent text-info-700 text-[length:inherit] no-underline cursor-pointer transition-colors duration-300 ease-in-out hover:bg-accent-200 outline-none focus-visible:outline-2 focus-visible:outline-info-700 focus-visible:outline-offset-4 focus-visible:rounded-[2px]',
  },
  variants: {
    underline: { true: { root: 'underline' } },
  },
});

interface CLinkProps {
  href?: string;
  target?: string;
  underline?: boolean;
  weight?: number | string;
}

const props = withDefaults(defineProps<CLinkProps>(), {
  href: '',
  target: '',
  underline: false,
  weight: '600',
});

const ui = computed(() => link({ underline: props.underline }));
</script>

<style>
:host {
  display: inline-flex;
}
</style>
