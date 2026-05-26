<template>
  <slot />
</template>

<script setup lang="ts">
import { onMounted, useHost, watch, toRefs } from 'vue';

const props = defineProps({
  size: { type: String, default: 'default' },
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

<style>
:host {
  place-items: center start;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
</style>
