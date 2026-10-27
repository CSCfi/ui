<template>
  <div>
    <a
      :class="ui.root()"
      v-bind="{
        ...linkAttributes(),
        ...(!!href ? { href } : {}),
        ...(!!target ? { target } : {}),
      }"
      part="root"
    >
      <slot />
    </a>
  </div>
</template>

<script setup lang="ts">
/**
 * @slot default - The visible content of the link
 *
 * @csspart root - The native `<a>` element carrying the link styling
 *
 * @seeded from csc-ui — verify
 */
import { tv } from 'tailwind-variants';
import { computed, useAttrs } from 'vue';

/**
 * Styling lives entirely in this `tailwind-variants` config: the
 * old `--_c-link-*` indirection layer is dropped and authored directly against
 * the design tokens. Customization is via `::part(root)`. The host
 * stays `display:contents`; the real box is the inner `a` (`part="root"`).
 *
 * Colour: the `link` semantic role — the purpose-built link token,
 * which themes in dark mode. The pre-migration code used `--c-info-700` only
 * because no dedicated link token existed in csc-ui yet; the hover
 * background is the `link-subtle` role (was the `--c-accent-200` swap).
 */
const link = tv({
  defaultVariants: {
    underline: false,
  },
  slots: {
    root: 'inline-flex cursor-pointer items-center justify-start gap-2 bg-transparent text-[length:inherit] font-semibold text-link no-underline transition-colors duration-300 ease-in-out outline-none hover:bg-link-subtle focus-visible:rounded-[2px] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-link focus-visible:outline-solid',
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
}

const props = withDefaults(defineProps<CLinkProps>(), {
  href: '',
  target: '',
  underline: false,
});

const ui = computed(() => link({ underline: props.underline }));

// The host's ARIA and link attributes name and qualify the link, not the
// wrapper around it; nothing else falls through.
defineOptions({ inheritAttrs: false });

const attrs = useAttrs();

const LINK_ATTRIBUTES = new Set([
  'download',
  'hreflang',
  'ping',
  'referrerpolicy',
  'rel',
  'type',
]);

// Read on every render: `attrs` is not reactive, but a changed host
// attribute re-renders the element.
const linkAttributes = () =>
  Object.fromEntries(
    Object.entries(attrs).filter(
      ([name]) => name.startsWith('aria-') || LINK_ATTRIBUTES.has(name),
    ),
  );
</script>

<style>
:host {
  display: inline-flex;
}
</style>
