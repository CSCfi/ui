<template>
  <!-- Documentation-wide flavor selection. -->
  <toolbar-menu
    :label="`Flavour: ${currentFlavor.label}`"
    :text="currentFlavor.label"
    @select="onSelect"
  >
    <template #icon="{ compact }">
      <c-icon
        :class="ICON_COLORS[currentFlavor.id]"
        :path="currentFlavor.icon"
        :size="compact ? undefined : 16"
      />
    </template>

    <c-menu-label>Flavour</c-menu-label>

    <c-menu-item
      v-for="option in FLAVORS"
      :key="option.id"
      :checked="option.id === currentFlavor.id"
      :value="option.id"
      type="radio"
    >
      <c-icon :class="ICON_COLORS[option.id]" :path="option.icon" :size="16" />
      {{ option.label }}
    </c-menu-item>
  </toolbar-menu>
</template>

<script setup lang="ts">
const { flavor, setFlavor } = useFlavor();

const onSelect = (event: CustomEvent<{ value: string }>) => {
  const { value } = event.detail;

  if (!isFlavor(value)) return;

  setFlavor(value);
};

const currentFlavor = computed(
  () => FLAVORS.find((option) => option.id === flavor.value) ?? FLAVORS[0]!,
);
</script>
