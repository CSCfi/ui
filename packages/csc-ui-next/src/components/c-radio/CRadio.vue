<template>
  <slot />
</template>

<script setup lang="ts">
// `<slot />` root (fragment) — keep consumer fallthrough attrs (class/style)
// on the host element instead of tripping the "renders fragment" warning.
defineOptions({ inheritAttrs: false });

defineProps({
  checked: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  value: { type: String, default: '' },
});
</script>

<style>
/* c-radio is a data-only element. The actual radio button visuals are
 * rendered by the parent <c-radio-group>, which scans for slotted
 * c-radio children at mount time and reads their attributes + text
 * content. We keep `display: none` so the unstyled fallback text
 * doesn't show — the group provides the rendered UI. */
:host {
  display: none;
}
</style>
