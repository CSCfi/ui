<template>
  <!-- Documentation-wide flavor selection. -->
  <c-menu distance="8" position="bottom-end" @select="onSelect">
    <c-button slot="trigger" size="small" text>
      <c-icon
        :class="ICON_COLORS[currentFlavor!.id]"
        :path="currentFlavor?.icon"
        :size="16"
      />

      {{ currentFlavor?.label }}
    </c-button>

    <c-menu-label>Flavour</c-menu-label>

    <c-menu-item
      v-for="option in FLAVORS"
      :key="option.id"
      :active="option.id === currentFlavor?.id"
      :value="option.id"
    >
      <c-icon :class="ICON_COLORS[option.id]" :path="option.icon" :size="16" />
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

const currentFlavor = computed(
  () => FLAVORS.find((option) => option.id === flavor.value) ?? FLAVORS[0],
);
</script>

<style scoped>
c-menu c-button {
  &::part(root) {
    color: var(--c-on-surface);
  }
}
</style>
