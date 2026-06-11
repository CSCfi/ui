<template>
  <div class="c-sub-navigation-item__wrapper">
    <div class="c-sub-navigation-item">
      <div class="c-sub-navigation-item__content">
        <div class="c-sub-navigation-item__slot">
          <slot />
        </div>
        <span v-if="active" class="visuallyhidden">, Current page</span>
      </div>

      <c-loader
        :size="32"
        :hide="!loading"
        style="pointer-events: none"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, useHost, watchEffect } from 'vue';

const props = defineProps({
  active: { type: Boolean, default: false },
  focusable: { type: Boolean, default: false },
  href: { type: String, default: '' },
  target: { type: String, default: '' },
  loading: { type: Boolean, default: false },
});

const host = useHost();

const redirect = (event: Event) => {
  if (event instanceof KeyboardEvent && event.key !== 'Enter') return;
  event.stopPropagation();
  // Closing the side menu is a side-effect of any sub-item navigation —
  // matches the Stencil behaviour of dismissing the drawer on click.
  const sidenav = document.querySelector('c-side-navigation') as
    | (HTMLElement & { menuVisible: boolean })
    | null;
  if (sidenav) sidenav.menuVisible = false;
  if (props.href) {
    if (props.target) window.open(props.href, props.target);
    else window.location.href = props.href;
  }
};

onMounted(() => {
  if (!host) return;
  host.setAttribute('role', 'menuitem');
  host.addEventListener('click', redirect);
  host.addEventListener('keydown', redirect);
  watchEffect(() => {
    host.setAttribute('tabindex', props.focusable ? '0' : '-1');
    host.classList.toggle('active', props.active);
    if (props.active) host.setAttribute('aria-current', 'page');
    else host.removeAttribute('aria-current');
  });
});
</script>

<style>
:host {
  --_c-sub-navigation-item-text-color: var(
    --c-sub-navigation-item-text-color,
    var(--c-text-body)
  );
  --_c-sub-navigation-item-background-color: var(
    --c-sub-navigation-item-background-color,
    var(--c-transparent)
  );
  --_c-sub-navigation-item-background-color-hover: var(
    --c-sub-navigation-item-background-color-hover,
    var(--c-primary-100)
  );
  --_c-sub-navigation-item-text-color-active: var(
    --c-sub-navigation-item-text-color-active,
    var(--c-primary-600)
  );
  --_c-sub-navigation-item-background-color-active: var(
    --c-sub-navigation-item-background-color-active,
    var(--c-white)
  );

  --_c-sub-navigation-item-sub-item-background-color-active: var(
    --c-sub-navigation-item-sub-item-background-color-active,
    var(--c-primary-100)
  );
  --_c-sub-navigation-item-sub-item-background-color-hover: var(
    --c-sub-navigation-item-sub-item-background-color-hover,
    var(--c-primary-100)
  );
  --_c-sub-navigation-item-sub-item-background-color: var(
    --c-sub-navigation-item-sub-item-background-color,
    var(--c-transparent)
  );
  --_c-sub-navigation-item-sub-item-text-color-active: var(
    --c-sub-navigation-item-sub-item-text-color-active,
    var(--c-primary-600)
  );
  --_c-sub-navigation-item-sub-item-text-color: var(
    --c-sub-navigation-item-sub-item-text-color,
    var(--c-text-body)
  );
}

/* Sub-level (nested inside a sub-navigation-item) overrides — toggled
 * by c-side-navigation-item adding the class to nested children. */
:host(.c-sub-navigation-item--sub-level) {
  --_c-sub-navigation-item-background-color: var(--_c-sub-navigation-item-sub-item-background-color);
  --_c-sub-navigation-item-text-color: var(--_c-sub-navigation-item-sub-item-text-color);
  --_c-sub-navigation-item-background-color-hover: var(--_c-sub-navigation-item-sub-item-background-color-hover);
  --_c-sub-navigation-item-text-color-active: var(--_c-sub-navigation-item-sub-item-text-color-active);
  --_c-sub-navigation-item-background-color-active: var(--_c-sub-navigation-item-sub-item-background-color-active);
}

.c-sub-navigation-item {
  align-items: center;
  background-color: var(--_c-sub-navigation-item-background-color);
  border-radius: 4px;
  color: var(--_c-sub-navigation-item-text-color);
  cursor: pointer;
  display: flex;
  font-weight: 400;
  line-height: 46px;
  margin: 0 8px;
  overflow: hidden;
  padding-left: 34px;
  position: relative;
  transition: background-color 0.2s ease-in;
  user-select: none;
}

.c-sub-navigation-item__wrapper {
  padding: 2px 0;
}

.c-sub-navigation-item__content {
  display: flex;
  align-items: center;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.c-sub-navigation-item__content::before {
  background-color: var(--_c-sub-navigation-item-text-color-active);
  content: '';
  height: 100%;
  left: 0;
  position: absolute;
  top: 0;
  transform: translateZ(0) translateX(-8px);
  transition: transform 0.2s ease-in-out;
  width: 8px;
}

.c-sub-navigation-item:hover {
  background-color: var(--_c-sub-navigation-item-background-color-hover);
  color: var(--_c-sub-navigation-item-text-color-active);
}

:host(.active) .c-sub-navigation-item {
  background-color: var(--_c-sub-navigation-item-background-color-active);
}

:host(.active) .c-sub-navigation-item__content::before {
  transform: translateZ(0) translateX(0);
}

::slotted(span) {
  margin-right: 8px;
  font-size: 20px;
  line-height: 1;
}

:host(:focus),
:host(:focus) .c-sub-navigation-item {
  outline: none;
}

:host(:focus-visible) .c-sub-navigation-item {
  outline: 2px var(--_c-sub-navigation-item-text-color-active) solid;
  outline-offset: 2px;
}

.c-sub-navigation-item__slot {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.c-sub-navigation-item__slot slot {
  display: flex;
  gap: 8px;
  align-items: center;
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
