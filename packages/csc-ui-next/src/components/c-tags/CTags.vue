<template>
  <slot />
</template>

<script lang="ts">
export interface CTagsProps {
  /**
   * Size of the tags
   *
   * @seeded from csc-ui — verify
   */
  size?: CTagsSize;
}

/**
 * Size propagated to every slotted `<c-tag>`. `small` renders compact tags;
 * omitting the attribute leaves the tags at their default size.
 */
export type CTagsSize = 'default' | 'small';
</script>

<script setup lang="ts">
/**
 * @slot default - Default slot
 *
 * @seeded from csc-ui — verify
 *
 * @subcomponents c-tag
 */
import { onMounted, toRefs, useHost, watch } from 'vue';

// `<slot />` root (fragment) + we write to the host below — keep fallthrough
// attrs on the host element instead of tripping the "renders fragment" warning.
defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<CTagsProps>(), {
  size: 'default',
});

const { size } = toRefs(props);

const host = useHost();

// The original Stencil c-tags reaches into its slotted children on mount
// and propagates `size="small"` onto each <c-tag>. Mirror that here so a
// consumer can just write `<c-tags size="small">` without setting size on
// each tag. Re-run whenever `size` changes — covers cases where the prop
// is set dynamically after mount.
const propagate = () => {
  if (!host) return;

  const tags = host.querySelectorAll('c-tag');
  tags.forEach((tag) => {
    if (size.value === 'small') {
      (tag as HTMLElement).setAttribute('size', 'small');
    } else {
      (tag as HTMLElement).removeAttribute('size');
    }
  });
};

onMounted(propagate);
watch(size, propagate);
</script>

<!--
  Escape-hatch CSS (ADR-0007): the only styling here is the host's flex layout.
  The host MUST be the styled box because the slotted <c-tag> children are
  direct light-DOM children of the host, and the flex `gap`/`flex-wrap` must
  apply to those distributed children — wrapping them in an inner <slot> box
  would move them out of the host's formatting context. This `:host` overrides
  the global `:host{display:contents}` (per-type sheet is adopted after the
  shared sheet, so it wins). No colours/tokens involved, so nothing to convert.
-->
<style>
:host {
  display: flex;
  flex-wrap: wrap;
  place-items: center start;
  gap: 4px;
}
</style>
