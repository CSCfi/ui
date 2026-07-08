<template>
  <!-- Documentation-wide flavor selection (ADR-0020). -->
  <c-menu position="bottom-end" @select="onSelect">
    <c-button slot="trigger" size="small" text>
      <c-icon :path="currentFlavor?.icon" :size="16" :class="ICON_COLORS[currentFlavor!.id]" />

      {{ currentFlavor?.label }}
    </c-button>

    <c-menu-label>Flavour</c-menu-label>

    <c-menu-item
      v-for="option in FLAVORS"
      :key="option.id"
      :value="option.id"
    >
      <c-icon :path="option.icon" :size="16" :class="ICON_COLORS[option.id]" />
      {{ option.label }}
    </c-menu-item>
  </c-menu>
</template>

<script setup lang="ts">
const { flavor, setFlavor } = useFlavor();

const onSelect = (event: CustomEvent<{ value: string }>) => {
  const { value } = event.detail;

  if (!isFlavor(value)) return;

  setFlavor(value);
};

const currentFlavor = computed(() => FLAVORS.find(option => option.id === flavor.value) ?? FLAVORS[0]);
</script>

<style scoped>
c-menu c-button {
  &::part(root) {
    color: var(--c-on-surface);
  }
}

c-menu::part(panel) {
  inset: 8px 0;
}
</style>
