<template>
  <component
    :is="href ? 'a' : 'div'"
    ref="contentRef"
    :class="ui.root()"
    :href="href || undefined"
    :target="href ? target : undefined"
    part="root"
  >
    <!--
      The slot must stay in the DOM so useHasSlot can find it and read its
      assignedNodes (gating the slot itself with v-if/v-show is a chicken-and-
      egg: it'd never render, so content is never detected). Vue forbids v-show
      on a <slot> outlet, so wrap it in a display:contents span (layout-neutral:
      the <slot> remains the flex item) and v-show that — collapsing the empty
      pre/post slot avoids a phantom gap from the root's `gap-4`.
    -->
    <span v-show="hasPre" :class="ui.slotWrap()"><slot name="pre" /></span>

    <slot />

    <span v-show="hasPost" :class="ui.slotWrap()"><slot name="post" /></span>

    <span v-if="ripple" :class="ui.ripples()" aria-hidden="true">
      <span
        v-for="r in ripples"
        :key="r.id"
        :class="ui.ripple()"
        :style="r.style"
      />
    </span>
  </component>
</template>

<script setup lang="ts">
import { tv } from 'tailwind-variants';
import { computed, onMounted, useHost, useTemplateRef, watchEffect } from 'vue';

import { useHasSlot } from '../../shared/useHasSlot';
import { useRipple } from '../../shared/useRipple';

/**
 * Styling lives in this `tailwind-variants` config (ADR-0004): the `root` slot
 * is the public content box and the `active` variant replaces the
 * `:host(.c-list-item--active)` text-color cascade. Consumer customization is
 * via `::part()` (ADR-0006); there is no `override` prop. The per-component
 * `--c-*` indirection vars are dropped in favour of global design tokens.
 *
 * The host box itself (background, hover/active/disabled/focus states) and the
 * projected `<slot>` layout cannot be expressed as utilities and remain in the
 * escape-hatch <style> below (ADR-0007); the ripple is the shared transition
 * primitive (useRipple + transition utilities, ADR-0004).
 */
const listItem = tv({
  defaultVariants: {
    active: false,
  },
  slots: {
    ripple:
      'absolute rounded-full bg-current pointer-events-none transition-[transform,opacity] duration-[600ms] ease-out',
    ripples:
      'absolute inset-0 overflow-hidden pointer-events-none rounded-[inherit]',
    root: 'flex items-center gap-4 min-h-[42px] p-3 w-full relative overflow-hidden rounded text-on-surface-muted no-underline',
    // Layout-neutral wrapper: display:contents so the wrapped <slot> is itself
    // the flex item of `root`. Only exists so v-show can collapse an empty
    // named slot (Vue forbids v-show on a <slot> outlet directly).
    slotWrap: 'contents',
  },
  variants: {
    active: { true: { root: 'text-primary' } },
  },
});

// The host is the real box: role="listitem"/tabindex/aria-*/disabled are set on
// it imperatively (below). Vue's defineCustomElement mirrors every non-prop host
// attribute into `$attrs`, which would otherwise fall through onto the shadow
// root `[part=root]` div — giving it a duplicate role, id and (for ripple items)
// tabindex="0", i.e. a second keyboard tab stop. Keep those on the host only.
defineOptions({ inheritAttrs: false });

interface CListItemProps {
  active?: boolean;
  disabled?: boolean;
  disabledByParent?: boolean;
  hoverable?: boolean;
  href?: string;
  ripple?: boolean;
  target?: string;
}

const props = withDefaults(defineProps<CListItemProps>(), {
  active: false,
  disabled: false,
  disabledByParent: false,
  hoverable: false,
  href: '',
  ripple: false,
  target: '_blank',
});

const ui = computed(() => listItem({ active: props.active }));

const host = useHost();

const contentRef = useTemplateRef<HTMLElement>('contentRef');

const hasPre = useHasSlot(contentRef, 'pre');

const hasPost = useHasSlot(contentRef, 'post');

const isHoverable = computed(
  () => props.ripple || !!props.href || props.hoverable,
);

// Reflect host-level a11y + state classes/attributes. The Stencil
// version set these on <Host>; here we drive them imperatively since the
// host is the real DOM element.
onMounted(() => {
  if (!host) return;
  host.setAttribute('role', 'listitem');
  watchEffect(() => {
    host.setAttribute('aria-disabled', String(!!props.disabled));
    host.classList.toggle('c-list-item--hoverable', isHoverable.value);
    host.classList.toggle('c-list-item--ripple', props.ripple);
    host.classList.toggle('c-list-item--active', props.active);

    // Empty attribute (not the string 'true') so re-reading it via the
    // custom-element wrapper doesn't fail this component's Boolean `disabled`
    // prop validator.
    if (props.disabled) host.setAttribute('disabled', '');
    else host.removeAttribute('disabled');

    if (props.disabledByParent) host.setAttribute('data-disabled', 'true');
    else host.removeAttribute('data-disabled');

    // tabindex: -1 when disabled, 0 when keyboard-activatable (ripple
    // without a real link), otherwise none.
    if (props.disabled) host.setAttribute('tabindex', '-1');
    else if (props.ripple && !props.href) host.setAttribute('tabindex', '0');
    else host.removeAttribute('tabindex');

    // Propagate active state to a nested c-list-item-title (mirrors the
    // Stencil @Watch('active') handler).
    const title = host.querySelector('c-list-item-title');

    if (title) (title as unknown as { active: boolean }).active = props.active;
  });
});

// Material-style click ripple (shared logic in useRipple); measured against
// the content box. Only rendered/spawned when the `ripple` prop is set.
const { ripples, spawn: spawnRipple } = useRipple({
  container: () => contentRef.value,
});

const onClick = (event: MouseEvent, center = false) => {
  if (props.disabled) {
    event.preventDefault();

    return;
  }

  if (!props.ripple) return;
  spawnRipple(event, { center });
};

const onKeyup = (event: KeyboardEvent) => {
  if (event.key === ' ' || event.key === 'Enter') {
    onClick(event as unknown as MouseEvent, true);
  }
};

// Listen on the host so clicks anywhere on the item trigger the ripple,
// matching the Stencil @Listen behaviour.
onMounted(() => {
  if (!host) return;
  host.addEventListener('click', onClick as EventListener);
  host.addEventListener('keyup', onKeyup as EventListener);
});
</script>

<!--
  Escape-hatch CSS (ADR-0007): only constructs Tailwind utilities cannot
  express. The content-box styling, ripple-dot statics and the `active` text
  color live in the `tv` config above. What remains here:
    - The host box itself and its positional/contextual state selectors
      (`:host(:focus-visible)`, `:host(.c-list-item--hoverable:hover)`,
      `:host(.c-list-item--active)`, `:host(.c-list-item--ripple)`,
      `:host([disabled])`) — utilities can't target the host.
    - `::slotted(c-icon)` recolouring inside a disabled item.
    - Layout of the projected `<slot>` elements (a `<slot>` is a shadow-tree
      node Vue renders without a class hook).
  Authored against global design tokens only.
-->
<style>
:host {
  display: block;
  background-color: transparent;
  border-radius: 4px;
}

/* Layout for the projected light-DOM content. Every `<slot>` stacks its
 * children as a small grid; the default (unnamed) slot grows to fill the row.
 * Equivalent to the original `.c-list-item__content slot` rules — the slots
 * only ever render inside the content box. */
slot {
  display: grid;
  gap: 4px;
  line-height: 1.5;
}

slot:not([name]) {
  flex: 1;
}

:host(:focus-visible) {
  outline: 2px var(--c-primary) solid;
  outline-offset: 2px;
}

:host(.c-list-item--hoverable:hover) {
  background-color: var(--c-primary-subtle-hover);
}

:host(.c-list-item--active) {
  background-color: var(--c-primary-subtle);
}

:host(.c-list-item--ripple) {
  cursor: pointer;
}

:host([disabled]) {
  background-color: var(--c-surface-muted);
  cursor: default;
  opacity: 0.75;
  pointer-events: none;
}

/* Grey a disabled item's slotted icon. c-icon applies its `color` prop as the
 * path's own inline fill, which inherited `color` cannot override, so use
 * c-icon's `--c-icon-color` override hook (it inherits across the shadow
 * boundary and wins over the prop fallback). */
:host([disabled]) ::slotted(c-icon) {
  --c-icon-color: var(--c-on-surface-muted) !important;
}
</style>
