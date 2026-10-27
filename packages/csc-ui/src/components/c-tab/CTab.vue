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
 * @slot default - The tab's label; a `c-badge` here sits on the tab's corner
 *
 * @csspart root - The box centring the tab's label
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
   *
   * @internal
   */
  tabchange: {
    element: HTMLElement | null;
    value: number | string | undefined;
  };

  /**
   * Fired when the tab receives focus, so the parent `<c-tabs>` can drive
   * arrow-key navigation.
   *
   * @internal
   */
  tabfocus: number | string | undefined;
}

/**
 * Styling lives in this `tailwind-variants` config; customization
 * is via `::part()`. The inner `root` content box, the ripple
 * container and the ripple dots are utilities here. `root` clips with an 8px
 * `overflow-clip-margin` rather than at its own edge: a `c-badge` slotted into
 * the tab is a corner overlay (`absolute -right-1.5 -top-1.5` plus a 2px ring,
 * so 8px of ink outside the tab box), and a hard clip swallowed it. The margin
 * lets that badge through while a too-long `whitespace-nowrap` label — vertical
 * tabs pin every tab to `min/max-width: 100%` — is still cut off.
 *
 * The host itself MUST be the styled/positioned tab box (it is the real
 * `role="tab"` element c-tabs queries and measures, with imperatively-toggled
 * `c-tab--active`/`c-tab--disabled` state and `:hover`/`:focus-visible` pseudo
 * states), so its styling stays in the escape-hatch <style> below. The ripple itself is the shared transition
 * primitive (useRipple + transition utilities).
 */
const tab = tv({
  slots: {
    ripple:
      'pointer-events-none absolute rounded-full bg-current transition-[transform,opacity] duration-[600ms] ease-out',
    ripples: 'pointer-events-none absolute inset-0 overflow-hidden',
    root: 'relative flex h-full w-full max-w-full items-center justify-center overflow-clip px-3 text-ellipsis whitespace-nowrap [overflow-clip-margin:8px]',
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
   * Whether this is the selected tab; the parent `<c-tabs>` sets it.
   *
   * @internal
   */
  active?: boolean;

  /**
   * Grey the tab out and keep it from being selected by pointer or keyboard;
   * the arrow keys skip it.
   */
  disabled?: boolean;

  /**
   * Whether the tab is the row's Tab stop though not active: no tab matches
   * the value; the parent `<c-tabs>` sets it.
   *
   * @internal
   */
  tabStop?: boolean;

  /**
   * Value of the tab, matching the `value` of the `c-tab-item` panel it shows;
   * `c-tabs` holds it as its `value` while this tab is active.
   */
  value?: number | string;
}

const props = withDefaults(defineProps<CTabProps>(), {
  active: false,
  disabled: false,
  tabStop: false,
  value: undefined,
});

const host = useHost();

const contentRef = useTemplateRef<HTMLElement>('contentRef');

const emit = useHostEmit<CTabEvents>();

const bubbling = { bubbles: true, composed: true };

// Reflect tab state + a11y onto the host (the real tab element c-tabs
// queries and wires id and aria-controls onto).
onMounted(() => {
  if (!host) return;
  host.setAttribute('role', 'tab');
  watchEffect(() => {
    host.classList.toggle('c-tab', true);
    host.classList.toggle('c-tab--active', props.active);
    host.classList.toggle('c-tab--disabled', props.disabled);
    // A disabled tab is announced as one (the arrow keys skip it).
    host.setAttribute('aria-disabled', String(props.disabled));
    host.setAttribute('aria-selected', String(props.active));

    if (props.value != null)
      host.setAttribute('data-value', String(props.value));
    host.setAttribute(
      'tabindex',
      (props.active || props.tabStop) && !props.disabled ? '0' : '-1',
    );
  });

  host.addEventListener('click', (e) => onClick(e as MouseEvent));
  host.addEventListener('focus', () => emit('tabfocus', props.value, bubbling));
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
  emit('tabchange', { element: host, value: props.value }, bubbling);
};
</script>

<!--
  Escape-hatch CSS: the host is the real `role="tab"` box c-tabs
  measures and drives. Its display/sizing/colour plus the imperatively-toggled
  `c-tab--active`/`c-tab--disabled` state classes and `:hover`/`:focus-visible`
  pseudo states are positional :host selectors utilities can't express, so they
  stay here (this :host overrides the global `:host{display:contents}`; the
  per-type sheet is adopted after the shared sheet, so it wins).

  The host deliberately does NOT clip. Its old `overflow: hidden` was a second
  copy of the `[part=root]` clip that bought nothing — `root` is `h-full w-full`
  so nothing reaches past the host through it, and the ripple is clipped by its
  own `.ripples` container — while it re-cut the slotted `c-badge` that root's
  `overflow-clip-margin` had just let through. Same split as c-button, whose
  root is unclipped and whose ripple container does the clipping.
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
  height: var(--_c-control-height);
  justify-content: center;
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
