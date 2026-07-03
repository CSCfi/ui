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
/**
 * Basic hyperlink component
 *
 * @slot default - The visible content of the link
 *
 * @csspart root - The native `<a>` element carrying the link styling
 *
 * @seeded from csc-ui — verify
 */
import { tv } from 'tailwind-variants';
import { computed } from 'vue';

/**
 * Styling lives entirely in this `tailwind-variants` config (ADR-0004): the
 * old `--_c-link-*` indirection layer is dropped and authored directly against
 * the design tokens. Customization is via `::part(root)` (ADR-0006). The host
 * stays `display:contents`; the real box is the inner `a` (`part="root"`).
 *
 * Colour: the `link` semantic role (ADR-0010) — the purpose-built link token,
 * which themes in dark mode. The pre-migration code used `--c-info-700` only
 * because no dedicated link token existed in csc-ui-next yet; the hover
 * background is the `link-subtle` role (was the `--c-accent-200` swap).
 */
const link = tv({
  defaultVariants: {
    underline: false,
  },
  slots: {
    root: 'inline-flex items-center justify-start gap-2 bg-transparent text-link text-[length:inherit] no-underline cursor-pointer transition-colors duration-300 ease-in-out hover:bg-link-hover outline-none focus-visible:outline-2 focus-visible:outline-link focus-visible:outline-offset-4 focus-visible:rounded-[2px]',
  },
  variants: {
    underline: { true: { root: 'underline' } },
  },
});

interface CLinkProps {
  /**
   * Url of link
   *
   * @seeded from csc-ui — verify
   * @freeform any URL
   */
  href?: string;
  /**
   * regular target attribute of a hyperlink
   *
   * @seeded from csc-ui — verify
   * @freeform any browsing-context name (e.g. _blank, _self)
   */
  target?: string;
  /**
   * Display line under the link
   *
   * @seeded from csc-ui — verify
   */
  underline?: boolean;
  /**
   * Customisable font weight
   *
   * @seeded from csc-ui — verify
   */
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
