<template>
  <div ref="contentRef" :class="ui.root()" part="root">
    <slot />

    <span :class="ui.ripples()" aria-hidden="true">
      <span
        v-for="r in ripples"
        :key="r.id"
        :class="ui.ripple()"
        :style="r.style"
      />
    </span>
  </div>
</template>

<script setup lang="ts">
/**
 * @slot default - Default slot
 *
 * @csspart root - The tab's inner content box centering the slotted label
 *
 * @seeded from csc-ui — verify
 */
import { tv } from 'tailwind-variants';
import { onMounted, useHost, useTemplateRef, watchEffect } from 'vue';

import { useHostEmit } from '../../shared/useHostEmit';
import { useRipple } from '../../shared/useRipple';

/** Events dispatched by `<c-tab>`. */
interface CTabEvents {
  /**
   * Fired when the tab is activated (click, or Space/Enter), carrying the tab
   * element and its value; the parent `<c-tabs>` listens for it to switch the
   * active tab.
   */
  tabChange: {
    element: HTMLElement | null;
    value: number | string | undefined;
  };
  /**
   * Fired when the tab receives focus, so the parent `<c-tabs>` can drive
   * arrow-key navigation.
   */
  tabFocus: number | string | undefined;
}

/**
 * Styling lives in this `tailwind-variants` config; customization
 * is via `::part()`. The inner `root` content box, the ripple
 * container and the ripple dots are utilities here. The host itself MUST be the
 * styled/positioned tab box (it is the real `role="tab"` element c-tabs queries
 * and measures, with imperatively-toggled `c-tab--active`/`c-tab--disabled`
 * state and `:hover`/`:focus-visible` pseudo states), so its styling stays in
 * the escape-hatch <style> below. The ripple itself is the shared transition
 * primitive (useRipple + transition utilities).
 */
const tab = tv({
  slots: {
    ripple:
      'absolute rounded-full bg-current pointer-events-none transition-[transform,opacity] duration-[600ms] ease-out',
    ripples: 'absolute inset-0 overflow-hidden pointer-events-none',
    root: 'flex items-center justify-center h-full w-full max-w-full overflow-hidden px-3 relative text-ellipsis whitespace-nowrap',
  },
});

const ui = tab();

// The host is the real `role="tab"` box: role/tabindex/id/aria-* are set on it
// imperatively (below, and by c-tabs). Vue's defineCustomElement mirrors every
// non-prop host attribute into `$attrs`, which would otherwise fall through onto
// the shadow root `[part=root]` div — giving it a *duplicate* role="tab",
// tabindex="0" and id. That produces a second keyboard tab stop per tab and a
// duplicated id (breaking aria-controls/labelledby). Suppress the fallthrough so
// these attributes live only on the host. (Same fix as c-toasts.)
defineOptions({ inheritAttrs: false });

interface CTabProps {
  /**
   * Mark tab as active
   *
   * @seeded from csc-ui — verify
   */
  active?: boolean;
  /**
   * Mark tab as disabled
   *
   * @seeded from csc-ui — verify
   */
  disabled?: boolean;
  /**
   * Id of the tab
   *
   * @seeded from csc-ui — verify
   * @freeform
   */
  hostId?: string;
  /**
   * Position in the set
   *
   * @seeded from csc-ui — verify
   */
  position?: number;
  /**
   * Size of the set
   *
   * @seeded from csc-ui — verify
   */
  setsize?: number;
  /**
   * Value for the tab
   * - for use in c-tabs
   *
   * @seeded from csc-ui — verify
   */
  value?: number | string;
}

const props = withDefaults(defineProps<CTabProps>(), {
  active: false,
  disabled: false,
  hostId: '',
  position: undefined,
  setsize: undefined,
  value: undefined,
});

const host = useHost();

const contentRef = useTemplateRef<HTMLElement>('contentRef');

const emit = useHostEmit<CTabEvents>();

const bubbling = { bubbles: true, composed: true };

// Reflect tab state + a11y onto the host (the real tab element c-tabs
// queries and wires aria-controls/posinset onto).
onMounted(() => {
  if (!host) return;
  host.setAttribute('role', 'tab');
  watchEffect(() => {
    host.classList.toggle('c-tab', true);
    host.classList.toggle('c-tab--active', props.active);
    host.classList.toggle('c-tab--disabled', props.disabled);
    host.setAttribute('aria-disabled', String(props.disabled));
    host.setAttribute('aria-hidden', String(props.disabled));
    host.setAttribute('aria-selected', String(props.active));

    if (props.setsize != null)
      host.setAttribute('aria-setsize', String(props.setsize));

    if (props.position != null)
      host.setAttribute('aria-posinset', String(props.position));

    if (props.hostId) host.setAttribute('id', props.hostId);

    if (props.value != null)
      host.setAttribute('data-value', String(props.value));
    host.setAttribute('tabindex', props.active && !props.disabled ? '0' : '-1');
  });

  host.addEventListener('click', (e) => onClick(e as MouseEvent));
  host.addEventListener('focus', () => emit('tabFocus', props.value, bubbling));
  host.addEventListener('keydown', (e) => {
    const ke = e as KeyboardEvent;

    if (ke.code === 'Space' || ke.code === 'Enter') {
      ke.preventDefault();
      onClick(ke as unknown as MouseEvent, true);
    }
  });
});

// Material-style click ripple (shared logic in useRipple); measured against
// the host, which is the real `role="tab"` box.
const { ripples, spawn: spawnRipple } = useRipple({ container: () => host });

const onClick = (event: MouseEvent, center = false) => {
  if (props.disabled) return;
  spawnRipple(event, { center });
  emit('tabChange', { element: host, value: props.value }, bubbling);
};
</script>

<!--
  Escape-hatch CSS: the host is the real `role="tab"` box c-tabs
  measures and drives. Its display/sizing/colour plus the imperatively-toggled
  `c-tab--active`/`c-tab--disabled` state classes and `:hover`/`:focus-visible`
  pseudo states are positional :host selectors utilities can't express, so they
  stay here (this :host overrides the global `:host{display:contents}`; the
  per-type sheet is adopted after the shared sheet, so it wins).
-->
<style>
:host {
  display: block;
  user-select: none;
  min-width: min-content;
  flex-grow: 1;
}

:host(:focus) {
  outline: none;
}

:host(:focus-visible) {
  border-radius: 4px;
  outline: 2px var(--c-primary) solid;
  outline-offset: 2px;
}

:host([aria-disabled='true']) {
  cursor: default !important;
}

slot {
  pointer-events: none;
}

:host(.c-tab) {
  align-items: center;
  color: var(--c-primary);
  cursor: pointer;
  display: inline-flex;
  font-weight: 600;
  height: 52px;
  justify-content: center;
  overflow: hidden;
  position: relative;
}

:host(.c-tab:hover) {
  background-color: var(--c-primary-subtle-hover);
}

:host(.c-tab--active:hover) {
  background-color: transparent !important;
}

:host(.c-tab--disabled) {
  color: var(--c-on-surface-muted);
  cursor: default;
  opacity: 0.75;
  pointer-events: none;
}
</style>
