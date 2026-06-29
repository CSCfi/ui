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
import { tv } from 'tailwind-variants';
import { onMounted, useHost, useTemplateRef, watchEffect } from 'vue';

import { useRipple } from '../../shared/useRipple';

/**
 * Styling lives in this `tailwind-variants` config (ADR-0004); customization
 * is via `::part()` (ADR-0006). The inner `root` content box, the ripple
 * container and the ripple dots are utilities here. The host itself MUST be the
 * styled/positioned tab box (it is the real `role="tab"` element c-tabs queries
 * and measures, with imperatively-toggled `c-tab--active`/`c-tab--disabled`
 * state and `:hover`/`:focus-visible` pseudo states), so its styling stays in
 * the escape-hatch <style> below. The ripple itself is the shared transition
 * primitive (useRipple + transition utilities, ADR-0004).
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

interface CTabProps {
  active?: boolean;
  disabled?: boolean;
  hostId?: string;
  position?: number;
  setsize?: number;
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

const emit = (name: string, detail: unknown) => {
  host?.dispatchEvent(
    new CustomEvent(name, { bubbles: true, composed: true, detail }),
  );
};

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
  host.addEventListener('focus', () => emit('tabFocus', props.value));
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
  emit('tabChange', { element: host, value: props.value });
};
</script>

<!--
  Escape-hatch CSS (ADR-0007): the host is the real `role="tab"` box c-tabs
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
  outline: 2px var(--c-primary-600) solid;
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
  color: var(--c-primary-600);
  cursor: pointer;
  display: inline-flex;
  font-weight: 600;
  height: 52px;
  justify-content: center;
  overflow: hidden;
  position: relative;
}

:host(.c-tab:hover) {
  background-color: var(--c-primary-100);
}

:host(.c-tab--active:hover) {
  background-color: transparent !important;
}

:host(.c-tab--disabled) {
  color: var(--c-tertiary-500);
  cursor: default;
  opacity: 0.75;
  pointer-events: none;
}
</style>
