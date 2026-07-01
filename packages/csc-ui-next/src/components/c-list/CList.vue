<template>
  <div :class="ui.root()" part="root">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { tv } from 'tailwind-variants';
import {
  computed,
  onBeforeUnmount,
  onMounted,
  useHost,
  watchEffect,
} from 'vue';

/**
 * Styling lives in this `tailwind-variants` config (ADR-0004): the `root` slot
 * is the public grid container that lays out the list items. Consumer
 * customization is via `::part()` (ADR-0006); there is no `override` prop. The
 * per-component `--c-*` indirection vars are dropped in favour of global design
 * tokens.
 *
 * The `bordered` outline targets consumer-provided `<c-list-item>` children via
 * `::slotted(...)`, which utilities cannot express — that rule stays in the
 * escape-hatch <style> below (ADR-0007).
 */
const list = tv({
  slots: {
    root: 'grid gap-1',
  },
});

// `role="list"` is set on the host imperatively. Vue's defineCustomElement
// mirrors non-prop host attributes into `$attrs`, which would otherwise fall
// through onto the shadow root `[part=root]` div — nesting a duplicate
// `role="list"` inside the host's list. Keep the role on the host only.
defineOptions({ inheritAttrs: false });

interface CListProps {
  bordered?: boolean;
  disabled?: boolean;
}

const props = withDefaults(defineProps<CListProps>(), {
  bordered: false,
  disabled: false,
});

const ui = computed(() => list());

const host = useHost();

// Propagate the list's disabled state to its <c-list-item> children WITHOUT ever
// clobbering an item the CONSUMER disabled. The sync is non-destructive: it only
// re-enables items the LIST itself disabled (tracked via `disabledByParent`).
//
// The previous approach set `item.disabled = props.disabled` for every item it
// didn't recognise as consumer-disabled — but recognition raced the child: Vue
// sets the item's `disabled` prop during patch (as a property, like it does for
// c-icon-button), yet for a brief window the item isn't yet seen as disabled, so
// a consumer-disabled item got reset to the list's `disabled` (false) and never
// recovered. Never setting `disabled = false` on an item we didn't disable
// removes the race entirely.
type CListItemEl = {
  disabled?: boolean;
  disabledByParent?: boolean;
} & HTMLElement;

const syncDisabled = () => {
  if (!host) return;

  const items = Array.from(
    host.querySelectorAll('c-list-item'),
  ) as CListItemEl[];
  items.forEach((item) => {
    if (props.disabled) {
      // List disabled: disable items that aren't already disabled, and remember
      // we own those so we can restore exactly them. A consumer-disabled item
      // (already disabled) is left untouched — not marked as ours.
      if (!item.disabled) {
        item.disabled = true;
        item.disabledByParent = true;
      }
    } else if (item.disabledByParent) {
      // List enabled: restore ONLY items the list disabled.
      item.disabled = false;
      item.disabledByParent = false;
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

<!--
  Escape-hatch CSS (ADR-0007): the `bordered` outline targets consumer-provided
  light-DOM <c-list-item> children, which only `::slotted(...)` can reach — the
  shadow-root `*` reset never touches light DOM and no utility can express it.
  The grid layout itself lives in the `tv` config above. Authored against global
  design tokens only.
-->
<style>
/*
  `!important` is required, not stylistic: the docs/app ship Tailwind's preflight
  (`*,::before,::after{border-width:0}`) at the document level, and the slotted
  c-list-item physically lives in that outer (light DOM) tree. Per CSS Scoping,
  NORMAL declarations from the outer tree beat `::slotted` rules from this inner
  tree regardless of specificity — so a plain border here is overridden to 0.
  `!important` flips the cross-tree precedence back to the inner tree.
*/
:host([bordered]) ::slotted(c-list-item) {
  border: 1px solid var(--c-border) !important;
  border-radius: 4px;
}

:host([bordered]) ::slotted(c-list-item.c-list-item--active) {
  border-color: var(--c-primary) !important;
}
</style>
