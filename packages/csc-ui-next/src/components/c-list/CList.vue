<template>
  <slot />
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, useHost, watchEffect } from 'vue';

const props = defineProps({
  disabled: { type: Boolean, default: false },
  bordered: { type: Boolean, default: false },
});

const host = useHost();

// Propagate the list's disabled state down to each child <c-list-item>.
// Items that were *explicitly* disabled by the consumer (have a
// `disabled` attribute but no `data-disabled` marker) are left alone so
// re-enabling the list doesn't re-enable them.
const syncDisabled = () => {
  if (!host) return;
  const items = Array.from(host.querySelectorAll('c-list-item')) as HTMLElement[];
  items.forEach((item) => {
    const explicitlyDisabled =
      item.hasAttribute('disabled') && !item.hasAttribute('data-disabled');
    if (!explicitlyDisabled) {
      (item as unknown as { disabled: boolean }).disabled = props.disabled;
      (item as unknown as { disabledByParent: boolean }).disabledByParent =
        props.disabled;
    }
  });
};

let observer: MutationObserver | null = null;
onMounted(() => {
  if (!host) return;
  host.setAttribute('role', 'list');
  watchEffect(syncDisabled);
  // Re-sync when items are added/removed.
  observer = new MutationObserver(syncDisabled);
  observer.observe(host, { childList: true });
});
onBeforeUnmount(() => observer?.disconnect());
</script>

<style>
:host {
  --_c-list-gap: var(--c-list-gap, 4px);
  --_c-list-border-color: var(--c-list-border-color, var(--c-tertiary-200));
  --_c-list-border-color-active: var(
    --c-list-border-color-active,
    var(--c-primary-600)
  );

  display: grid;
  gap: var(--_c-list-gap);
}

/* `bordered` outlines each item. Slotted elements live in the light DOM,
 * so the shadow-root `*` reset never touches them and ::slotted targets
 * them directly. */
:host([bordered]) ::slotted(c-list-item) {
  border: 1px solid var(--_c-list-border-color);
  border-radius: 4px;
}

:host([bordered]) ::slotted(c-list-item.c-list-item--active) {
  border-color: var(--_c-list-border-color-active);
}
</style>
