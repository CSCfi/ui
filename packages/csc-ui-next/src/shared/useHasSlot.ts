import { onBeforeUnmount, onMounted, ref, type Ref } from 'vue';

/**
 * Track whether a named (or default) `<slot>` inside this custom element's
 * shadow root currently has any assigned nodes from the light DOM.
 *
 * `useSlots()` from Vue's composition API does NOT report slot population
 * for components compiled via `defineCustomElement` + plugin-vue's
 * `customElement` mode — Vue's slot system is bypassed and projection goes
 * through native `HTMLSlotElement`s instead. This composable listens to
 * the slot's native `slotchange` event and exposes a reactive boolean.
 *
 * Usage:
 *   const containerRef = useTemplateRef('container');
 *   const hasIcon = useHasSlot(containerRef, 'icon');
 *
 *   <template>
 *     <div ref="container" v-show="hasIcon"><slot name="icon" /></div>
 *   </template>
 *
 * `containerRef` must point to a DOM element that is an ancestor of the
 * `<slot>` element (so we can query for it). Pass an empty string for the
 * default (unnamed) slot.
 */
export function useHasSlot(
  container: Ref<HTMLElement | null>,
  name: string,
): Ref<boolean> {
  const has = ref(false);
  let slot: HTMLSlotElement | null = null;
  const update = () => {
    has.value = !!slot && slot.assignedNodes({ flatten: true }).length > 0;
  };

  onMounted(() => {
    const el = container.value;
    if (!el) return;
    const selector = name ? `slot[name="${name}"]` : 'slot:not([name])';
    slot = el.querySelector<HTMLSlotElement>(selector);
    if (!slot) return;
    slot.addEventListener('slotchange', update);
    update();
  });

  onBeforeUnmount(() => {
    slot?.removeEventListener('slotchange', update);
  });

  return has;
}
