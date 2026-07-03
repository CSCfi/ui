<template>
  <div :class="ui.root()" :data-badge="hasBadge ? badge : null" part="root">
    <slot />

    <c-icon-button
      v-if="closeable"
      :class="ui.close()"
      size="x-small"
      text
      @click="onClose"
    >
      <c-icon :path="mdiClose" :size="16" />
    </c-icon-button>
  </div>
</template>

<script lang="ts">
export interface CTagProps {
  /**
   * Mark tag as active
   *
   * @seeded from csc-ui — verify
   */
  active?: boolean;
  /**
   * Display an optional badge at the start of the tag
   *
   * @seeded from csc-ui — verify
   */
  badge?: null | number | string;
  /**
   * Mark tag as closeable
   *
   * @seeded from csc-ui — verify
   */
  closeable?: boolean;
  /**
   * Remove the hover effect
   *
   * @seeded from csc-ui — verify
   */
  flat?: boolean;
  /**
   * Size of the tag
   *
   * @seeded from csc-ui — verify
   */
  size?: CTagSize;
}

/**
 * Size of the tag. `small` renders a more compact pill; omitting the
 * attribute renders the default size.
 */
export type CTagSize = 'default' | 'small';
</script>

<script setup lang="ts">
/**
 * @slot default - Default slot
 * @csspart root - The tag's visible pill-shaped box
 *
 * @seeded from csc-ui — verify
 */
import { mdiClose } from '@mdi/js';
import { tv } from 'tailwind-variants';
import { computed, onMounted, useHost, watchEffect } from 'vue';

import { useHostEmit } from '../../shared/useHostEmit';

/** Events dispatched by `<c-tag>`. */
interface CTagEvents {
  /** Fired when the tag's close button is activated. */
  close: void;
}

/**
 * Styling lives entirely in this `tailwind-variants` config (ADR-0004): the
 * `root` slot is the tag's inner box and the `active`/`size`/
 * `flat`/`closeable`/`badged` variants replace the original `:host([attr])`
 * cascade. Consumer customization is via `::part(root)` (ADR-0006); there is no
 * `override` prop. The per-component `--c-tag-*` indirection vars are dropped in
 * favour of the semantic primary role (ADR-0010):
 *   resting text + border  -> the primary role colour (text + inset ring)
 *   active fill            -> the primary role; active text -> its on-colour
 *   resting hover tint     -> the primary subtle fill
 *   active hover fill      -> the primary hover step
 *
 * The badge is the inner box's `::before` (content: attr(data-badge)),
 * converted to `before:` utilities. The close button is a child <c-icon-button>:
 * its colour vars are gone, so it inherits the tag's text colour via the `color`
 * property (`close` slot's `text-*`) and is sized via its own `size` prop.
 *
 * The host's hover/focus-visible styling can't be a variant (positional/state
 * `:host(...)`); it stays in the escape-hatch <style> below (ADR-0007), which
 * also restores the host box.
 */
// Hoisted so the runtime guard below can test membership; the `satisfies`
// keeps the map complete against the public union (ADR-0015).
const sizeVariants = {
  default: { root: 'min-h-7 py-1 px-3 before:h-5 before:min-w-5' },
  small: { root: 'min-h-5 py-0.5 px-2 before:h-4 before:min-w-4' },
} satisfies Record<CTagSize, object>;

const tag = tv({
  compoundVariants: [
    // closeable trims the trailing padding to the vertical padding value.
    { class: { root: 'pr-1' }, closeable: true, size: 'default' },
    { class: { root: 'pr-0.5' }, closeable: true, size: 'small' },
    // badge trims the left padding to the vertical padding value
    { badged: true, class: { root: 'pl-0.5' }, size: 'small' },
    { badged: true, class: { root: 'pl-1' }, size: 'default' },
  ],
  defaultVariants: {
    active: false,
    badged: false,
    closeable: false,
    flat: false,
    size: 'default',
  },
  slots: {
    // Child c-icon-button: recolour via inherited `color`, not the dead vars.
    close: 'text-primary',
    // The tag's visible box. The host stays a real box (see <style>) so that
    // :host(:hover) can recolour this inner element via descendant selectors.
    root:
      'inline-flex items-center justify-center select-none cursor-pointer rounded-full min-w-12 gap-2 text-sm font-normal leading-none [transform:translate3d(0,0,0)] transition-colors duration-200 ease-in-out bg-transparent text-primary ring-1 ring-inset ring-primary ' +
      // badge ::before defaults — hidden until the `badged` variant reveals it
      // with `before:grid`. (Keep only ONE display utility per state: a base
      // `before:grid` here would let tailwind-merge drop `before:hidden`, so the
      // pill would always show.)
      'before:content-[attr(data-badge)] before:hidden before:place-content-center before:rounded-full before:px-1 before:text-xs before:leading-none before:bg-primary before:text-on-primary',
  },
  variants: {
    active: {
      true: {
        close: 'text-on-primary',
        root: 'bg-primary text-on-primary ring-primary before:bg-surface before:text-primary',
      },
    },
    // data-badge present: reveal the ::before pill (grid centres the value) and
    // add left padding.
    badged: { true: { root: 'before:grid pl-1' } },
    closeable: { true: {} },
    flat: { true: { root: 'pointer-events-none' } },
    size: sizeVariants,
  },
});

// The host is the real focusable box: role="button"/tabindex are set on it
// imperatively (below). Vue's defineCustomElement mirrors every non-prop host
// attribute into `$attrs`, which would otherwise fall through onto the shadow
// root `[part=root]` div — giving it a duplicate role="button", tabindex="0"
// and id, i.e. a second keyboard tab stop per tag. Keep those on the host only.
defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<CTagProps>(), {
  active: false,
  badge: null,
  closeable: false,
  flat: false,
  size: 'default',
});

const host = useHost();

const emit = useHostEmit<CTagEvents>();

const hasBadge = computed(
  () => props.badge !== null && props.badge !== '' && props.badge !== undefined,
);

// Attributes can deliver any string at runtime; unknown values fall back to
// the default size (ADR-0015).
const ui = computed(() =>
  tag({
    active: props.active,
    badged: hasBadge.value,
    closeable: props.closeable,
    flat: props.flat,
    size: props.size in sizeVariants ? props.size : 'default',
  }),
);

// Stencil version exposes tabindex + role=button on the host so a tag is
// keyboard-focusable like a button. `flat` tags skip both because they
// are non-interactive labels.
onMounted(() => {
  if (!host) return;
  watchEffect(() => {
    if (props.flat) {
      host.setAttribute('tabindex', '-1');
      host.removeAttribute('role');
    } else {
      host.setAttribute('tabindex', '0');
      host.setAttribute('role', 'button');
    }
  });
});

const onClose = () => {
  emit('close');
};
</script>

<!--
  Escape-hatch CSS (ADR-0007): only constructs Tailwind utilities cannot
  express. The tag's box and all variant colours live in the `tv` config above.
  What remains:
    - The host must be a real box so it can be focused/hovered as a unit and so
      its state selectors can recolour the inner `root` element. This `:host`
      overrides the global `:host{display:contents}` (per-type sheet wins).
    - Positional/state `:host(:hover)`, `:host(:focus)`, `:host(:focus-visible)`
      — utilities can't target the host. Hover recolours the inner box;
      focus-visible draws the outline. Authored against global tokens only.
-->
<style>
:host {
  display: inline-flex;
  border-radius: 999px;
}

/* Non-active hover: the primary subtle tint. */
:host(:hover) [part='root'] {
  background-color: var(--c-primary-subtle);
}

/* Active hover: the primary hover step, and drop the inset ring (box-shadow). */
:host([active]:hover) [part='root'] {
  background-color: var(--c-primary-hover);
  box-shadow: none;
}

:host(:focus) {
  outline: none;
}

:host(:focus-visible) {
  outline: 2px var(--c-primary) solid;
  outline-offset: 2px;
  z-index: 1;
}

/* The close button was a fixed 20px (16px on small tags) via the old
 * c-icon-button size vars, which are removed (ADR-0004). The smallest size
 * variant is x-small (28px), so re-pin the box through ::part() — the
 * sanctioned child-customization mechanism (ADR-0006). Keeps a small tag from
 * being forced taller by an oversized close button. */
c-icon-button::part(root) {
  width: 20px;
  height: 20px;
}

:host([size='small']) c-icon-button::part(root) {
  width: 16px;
  height: 16px;
}
</style>
