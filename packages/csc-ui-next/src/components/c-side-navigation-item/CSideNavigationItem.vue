<template>
  <div>
    <component
      :is="href ? 'a' : 'div'"
      class="c-side-navigation-item__header"
      :class="{ 'c-side-navigation-item__header--expandable': slotHasContent }"
      :href="href || undefined"
      :target="href ? target : undefined"
    >
      <c-icon v-if="slotHasContent" class="svg" :path="chevronIcon" />
      <div class="c-side-navigation-item__slot">
        <slot />
      </div>
    </component>

    <nav
      v-if="slotHasContent"
      role="menubar"
      :aria-label="ariaLabel"
      :aria-expanded="String(!!active)"
      :class="{ subnavactive: active, 'sub-item': !active }"
    >
      <slot name="sub-item" />
    </nav>

    <c-loader
      :size="32"
      :hide="!loading"
      style="pointer-events: none"
    />
  </div>
</template>

<script setup lang="ts">
import { mdiChevronRight } from '@mdi/js';
import { onMounted, ref, useHost, watchEffect } from 'vue';

const props = defineProps({
  active: { type: Boolean, default: false },
  href: { type: String, default: '' },
  target: { type: String, default: '' },
  loading: { type: Boolean, default: false },
});

const chevronIcon = mdiChevronRight;
const host = useHost();
const slotHasContent = ref(false);
const isSubItem = ref(false);
const ariaLabel = ref('');

// Move nested c-side-navigation-item children into the "sub-item" named
// slot. Mirrors Stencil's _assignSubItemSlots — consumers write nested
// items without manually specifying the slot.
const assignSubItemSlots = () => {
  if (!host) return;
  host.querySelectorAll('c-side-navigation-item').forEach((item) => {
    item.setAttribute('slot', 'sub-item');
  });
};

// Sub-items rendered inside another sub-navigation-item get a marker
// class so the sub-item CSS variant kicks in (Stencil sets this in
// componentDidLoad via _handleChildClasses).
const handleChildClasses = () => {
  if (!isSubItem.value || !host) return;
  Array.from(host.children)
    .filter((c) => c.tagName === 'C-SUB-NAVIGATION-ITEM')
    .forEach((c) => c.classList.add('c-sub-navigation-item--sub-level'));
};

// Propagate focusability + aria-hidden to sub-navigation-item children
// based on this item's expanded state — hidden subitems shouldn't be
// in the tab order.
const handleChildFocusableChange = (focusable: boolean) => {
  if (!slotHasContent.value || !host) return;
  host
    .querySelectorAll('[slot="sub-item"]')
    .forEach((child: Element) => {
      const c = child as HTMLElement & { focusable?: boolean };
      c.setAttribute('aria-hidden', String(!focusable));
      c.focusable = focusable;
    });
};

const dispatchItemChange = (event: Event) => {
  host?.dispatchEvent(
    new CustomEvent('itemChange', { detail: event, bubbles: true, composed: true }),
  );
};

const redirect = (event: KeyboardEvent | Event) => {
  if (event instanceof KeyboardEvent && event.key !== 'Enter') return;
  if (isSubItem.value) {
    event.stopPropagation();
    event.stopImmediatePropagation?.();
    event.preventDefault();
  }
  dispatchItemChange(event);
  if (!slotHasContent.value) {
    const sidenav = document.querySelector('c-side-navigation') as
      | (HTMLElement & { menuVisible: boolean })
      | null;
    if (sidenav) sidenav.menuVisible = false;
  }
};

onMounted(() => {
  if (!host) return;
  assignSubItemSlots();
  slotHasContent.value = !!host.querySelector('[slot="sub-item"]');
  isSubItem.value = !!host.getAttribute('slot');

  // Pull aria-label from the first text node (Stencil mirrors this for
  // the nested <nav>).
  for (const node of Array.from(host.childNodes)) {
    if (node.nodeType === Node.TEXT_NODE && node.nodeValue?.trim()) {
      ariaLabel.value = node.nodeValue.trim();
      break;
    }
  }

  host.setAttribute('role', 'menuitem');
  host.setAttribute('tabindex', '0');
  host.addEventListener('click', redirect);
  host.addEventListener('keydown', redirect);
  // A nested item bubbling its own itemChange shouldn't toggle the
  // parent — instead toggle this item's active and swallow.
  host.addEventListener('itemChange', (e) => {
    if (isSubItem.value) {
      e.stopPropagation();
      e.stopImmediatePropagation?.();
      e.preventDefault();
      // Re-assign via host so Vue's prop setter runs.
      (host as { active?: boolean }).active = !props.active;
    }
  });

  handleChildClasses();
  handleChildFocusableChange(props.active);

  watchEffect(() => {
    host.classList.toggle('c-side-navigation-item', true);
    host.classList.toggle('c-side-navigation-item--parent', slotHasContent.value);
    host.classList.toggle('active', props.active);
    if (slotHasContent.value) {
      host.setAttribute('aria-expanded', String(!!props.active));
      host.removeAttribute('aria-current');
    } else if (props.active) {
      host.setAttribute('aria-current', 'page');
      host.removeAttribute('aria-expanded');
    } else {
      host.removeAttribute('aria-current');
      host.removeAttribute('aria-expanded');
    }
    handleChildFocusableChange(props.active);
  });
});
</script>

<style>
:host {
  --_c-side-navigation-item-background-color-active: var(--c-side-navigation-item-background-color-active, var(--c-primary-200));
  --_c-side-navigation-item-background-color-hover: var(--c-side-navigation-item-background-color-hover, var(--c-primary-500));
  --_c-side-navigation-item-background-color: var(--c-side-navigation-item-background-color, var(--c-transparent));
  --_c-side-navigation-item-outline-color: var(--c-side-navigation-item-outline-color, var(--c-white));
  --_c-side-navigation-item-text-color-active: var(--c-side-navigation-item-text-color-active, var(--c-primary-600));
  --_c-side-navigation-item-text-color: var(--c-side-navigation-item-text-color, var(--c-white));

  --_c-side-navigation-item-sub-item-background-color-active: var(--c-side-navigation-item-sub-item-background-color-active, var(--c-white));
  --_c-side-navigation-item-sub-item-background-color-hover: var(--c-side-navigation-item-sub-item-background-color-hover, var(--c-primary-100));
  --_c-side-navigation-item-sub-item-background-color: var(--c-side-navigation-item-sub-item-background-color, var(--c-white));
  --_c-side-navigation-item-sub-item-outline-color: var(--c-side-navigation-item-sub-item-outline-color, var(--c-primary-600));
  --_c-side-navigation-item-sub-item-text-color-active: var(--c-side-navigation-item-sub-item-text-color-active, var(--c-primary-600));
  --_c-side-navigation-item-sub-item-text-color: var(--c-side-navigation-item-sub-item-text-color, var(--c-primary-600));
}

:host(.c-side-navigation-item) > div {
  align-items: center;
  backface-visibility: hidden;
  border-radius: 4px 0 0 4px;
  background-color: var(--_c-side-navigation-item-background-color);
  color: var(--_c-side-navigation-item-text-color);
  cursor: pointer;
  display: grid;
  grid-template-columns: 1fr;
  font-weight: 400;
  overflow: hidden;
  position: relative;
  transform: translate3d(0, 0, 0);
  user-select: none;
}

:host(.c-side-navigation-item:hover) > div {
  background-color: var(--_c-side-navigation-item-background-color-hover);
}

:host(.c-side-navigation-item:focus) > div {
  outline: none;
}

:host(.c-side-navigation-item:focus-visible) > div {
  outline: 2px var(--_c-side-navigation-item-outline-color) solid;
  outline-offset: 2px;
}

:host(.c-side-navigation-item.active) > div {
  background-color: var(--_c-side-navigation-item-background-color-active);
  color: var(--_c-side-navigation-item-text-color-active);
}

:host(.c-side-navigation-item.active) > div .svg {
  fill: var(--_c-side-navigation-item-text-color-active);
  transform: rotate(90deg);
}

:host(.c-side-navigation-item.active) > div .c-side-navigation-item__header {
  color: var(--_c-side-navigation-item-text-color-active);
}

.c-side-navigation-item__header {
  align-items: center;
  color: var(--_c-side-navigation-item-text-color);
  display: grid;
  gap: 8px;
  grid-template-columns: 1fr;
  min-height: 46px;
  padding: 8px 12px;
  text-decoration: none;
}

.c-side-navigation-item__header--expandable {
  grid-template-columns: auto 1fr;
}

.c-side-navigation-item__slot {
  align-items: center;
  display: flex;
  gap: 8px;
  line-height: normal;
  max-width: 100%;
}

:host(.c-side-navigation-item--parent.active) > div {
  padding-bottom: 4px;
}

::slotted(span),
::slotted(c-icon) {
  font-size: 20px;
}

.sub-item {
  height: 0;
  overflow-y: hidden;
  transition: all 500ms ease;
  width: 100%;
}

.subnavactive {
  height: max-content;
  width: 100%;
}

.svg {
  align-self: center;
  fill: var(--_c-side-navigation-item-text-color);
  transition: transform 0.3s ease;
}

/* Sub-item variant: nested c-side-navigation-item rendered inside the
 * "sub-item" slot of its parent. Re-points the palette to the lighter
 * sub-item one and adds margin/border-radius. */
:host([slot='sub-item']) {
  --_c-side-navigation-item-text-color: var(--c-side-navigation-item-text-color, var(--_c-side-navigation-item-sub-item-text-color));
  --_c-side-navigation-item-background-color: var(--c-side-navigation-item-background-color, var(--_c-side-navigation-item-sub-item-background-color));
  --_c-side-navigation-item-background-color-hover: var(--c-side-navigation-item-background-color-hover, var(--_c-side-navigation-item-sub-item-background-color-hover));
  --_c-side-navigation-item-text-color-active: var(--c-side-navigation-item-text-color-active, var(--_c-side-navigation-item-sub-item-text-color-active));
  --_c-side-navigation-item-background-color-active: var(--c-side-navigation-item-background-color-active, var(--_c-side-navigation-item-sub-item-background-color-active));
  --_c-side-navigation-item-outline-color: var(--c-side-navigation-item-outline-color, var(--_c-side-navigation-item-sub-item-outline-color));
}

:host([slot='sub-item']) > div {
  border-radius: 4px;
  margin: 0 8px 4px;
}
</style>
