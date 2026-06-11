<template>
  <div :class="containerClasses">
    <nav ref="container" :class="navClasses" role="menubar">
      <div v-if="mobile" class="c-side-navigation__burger">
        <c-icon-button text inverted @click="closeMenu">
          <span class="visuallyhidden">Close sidemenu</span>
          <c-icon :path="arrowRight" />
        </c-icon-button>
      </div>

      <div
        class="c-side-navigation__wrapper"
        :class="{ 'c-side-navigation__wrapper--mobile': mobile }"
      >
        <slot />
        <div class="vertical-spacer" />
        <slot name="bottom" />
      </div>
    </nav>
  </div>

  <div
    v-if="menuVisibleInternal && mobile"
    class="c-overlay c-fade-in"
    @click="closeMenu"
  />
</template>

<script setup lang="ts">
import { mdiArrowRight } from '@mdi/js';
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
  useHost,
  useTemplateRef,
  watch,
  watchEffect,
} from 'vue';

const props = defineProps({
  styles: { type: Object as () => Record<string, string>, default: null },
  mobile: { type: Boolean, default: false },
  menuVisible: { type: Boolean, default: false },
});

const arrowRight = mdiArrowRight;
const host = useHost();
const container = useTemplateRef<HTMLElement>('container');
const menuVisibleInternal = ref(props.menuVisible);

watch(
  () => props.menuVisible,
  (v) => {
    menuVisibleInternal.value = v;
  },
);

// Expose menuVisible setter so sub-navigation-item / side-navigation-item
// can close the drawer via `document.querySelector('c-side-navigation').menuVisible = false`.
// Vue's defineCustomElement already creates the property setter for the
// prop; the watcher above keeps internal state in sync when consumers
// pass the prop reactively.
const closeMenu = () => {
  menuVisibleInternal.value = false;
  host?.dispatchEvent(new CustomEvent('update:menuVisible', { detail: false }));
  host?.dispatchEvent(new CustomEvent('update:menu-visible', { detail: false }));
};

// Reflect c-side-navigation-item's itemChange: when a top-level item is
// activated, deactivate any other parent (an "accordion"-style behaviour).
const handleItemChange = (event: Event) => {
  if (!host) return;
  const target = event.target as (HTMLElement & { active: boolean });
  const wasActive = target.active;
  const items = host.querySelectorAll('c-side-navigation-item');

  items.forEach((item) => {
    const el = item as HTMLElement & { active: boolean };
    if (el.querySelector('c-sub-navigation-item[slot="sub-item"]')) {
      el.active = false;
    }
  });

  if (target.querySelector('[slot="sub-item"]')) {
    target.active = !wasActive;
  } else {
    target.active = true;
  }
};

const containerClasses = computed(() => ({
  'c-side-navigation__content': true,
  'c-side-navigation__content--hidden': !menuVisibleInternal.value,
  'c-side-navigation__content--mobile': !!props.mobile,
  'c-side-navigation__content--desktop': !props.mobile,
}));

const navClasses = computed(() => ({
  'c-side-navigation': true,
  'hide-menu': !menuVisibleInternal.value,
  mobile: !!props.mobile,
  desktop: !props.mobile,
}));

// Global click/keyup listener: c-navigation-button anywhere on the page
// toggles the side navigation. Matches Stencil's componentDidLoad.
const onDocEvent = (e: Event) => {
  const t = e.target as HTMLElement;
  if (!t?.matches?.('c-navigation-button')) return;
  if (e.type === 'click') {
    menuVisibleInternal.value = !menuVisibleInternal.value;
  } else if (e instanceof KeyboardEvent && e.key === 'Enter') {
    menuVisibleInternal.value = !menuVisibleInternal.value;
  }
};

// Move c-sub-navigation-item children into the "sub-item" slot —
// consumers write them inline.
const assignSubItemSlots = () => {
  if (!host) return;
  host.querySelectorAll('c-sub-navigation-item').forEach((item) => {
    item.setAttribute('slot', 'sub-item');
  });
};

onMounted(() => {
  if (!host) return;
  assignSubItemSlots();
  host.addEventListener('itemChange', handleItemChange);

  if (props.styles && container.value) {
    Object.assign(container.value.style, props.styles);
  }

  host.classList.toggle('desktop', !props.mobile);

  document.body.addEventListener('click', onDocEvent);
  document.body.addEventListener('keyup', onDocEvent);

  watchEffect(() => {
    host.classList.toggle('desktop', !props.mobile);
  });
});

onBeforeUnmount(() => {
  document.body.removeEventListener('click', onDocEvent);
  document.body.removeEventListener('keyup', onDocEvent);
});
</script>

<style>
:host {
  --_c-side-navigation-background-color: var(
    --c-side-navigation-background-color,
    var(--c-primary-600)
  );
  --_c-side-navigation-overlay-color: var(
    --c-side-navigation-overlay-color,
    rgba(var(--c-black), 0.5)
  );
}

:host(.autoheight) {
  height: calc(100vh - 60px);
  overflow-y: auto;
  overflow-x: hidden;
}

:host(.desktop) {
  background-color: var(--_c-side-navigation-background-color);
  display: flex;
  min-width: clamp(300px, 20vw, 340px);
}

.c-side-navigation {
  background-color: var(--_c-side-navigation-background-color);
  display: flex;
  flex-flow: column nowrap;
  flex: 1;
  gap: 4px;
  min-height: fit-content;
  padding: 24px 0 24px 24px;
  position: relative;
  transition: transform 0.3s ease;
  width: 100%;
  z-index: 8;
  max-height: 100%;
  overflow-y: auto;
}

.c-side-navigation__wrapper {
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  min-height: 100%;
}

.c-side-navigation__wrapper--mobile {
  min-height: calc(100% - 60px);
}

.c-side-navigation__content {
  display: flex;
  flex-direction: column;
  flex: 1 2 260px;
  width: 320px;
}

.c-side-navigation__content--mobile {
  height: 100vh;
  max-width: 320px;
  overflow-y: scroll;
  position: fixed;
  right: 0;
  top: 0;
  transition: transform 0.2s cubic-bezier(0.25, 0.8, 0.5, 1);
  transform: translateX(0%);
  z-index: 999;
}

.c-side-navigation__content--mobile.c-side-navigation__content--hidden {
  transform: translateX(100%);
}

.c-side-navigation__content--mobile > nav {
  min-height: auto;
  padding-top: 0;
}

.c-side-navigation__burger {
  display: flex;
  justify-content: flex-end;
  padding: 8px 16px;
}

.vertical-spacer {
  flex: 1;
  margin-bottom: 8px;
}

.c-overlay {
  background: var(--_c-side-navigation-overlay-color);
  backdrop-filter: blur(4px);
  inset: 0;
  position: fixed;
  z-index: 998;
}

@keyframes c-side-nav-fade-in {
  0% { opacity: 0; }
  100% { opacity: 1; }
}

.c-fade-in {
  animation-duration: 0.5s;
  animation-iteration-count: 1;
  animation-name: c-side-nav-fade-in;
  z-index: 997;
}

::slotted(c-side-navigation-item),
::slotted(c-sub-navigation-item) {
  display: contents;
}

.visuallyhidden {
  border: 0;
  clip: rect(0 0 0 0);
  height: 1px;
  margin: -1px;
  overflow: hidden;
  padding: 0;
  position: absolute;
  white-space: nowrap;
  width: 1px;
}
</style>
