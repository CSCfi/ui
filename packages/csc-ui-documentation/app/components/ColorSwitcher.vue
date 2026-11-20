<template>
  <toolbar-menu
    :label="`Primary colour: ${currentColor.label}`"
    :text="currentColor.label"
    @select="onSelect"
  >
    <template #icon="{ compact }">
      <span
        :class="compact ? 'size-4' : 'size-3'"
        :style="{ 'background-color': currentColor.value }"
        class="rounded-full"
      />
    </template>

    <template v-for="(color, index) in colors" :key="index">
      <template v-if="color.type === 'color'">
        <c-menu-item
          :checked="color.value === currentColor.value"
          :value="color"
          type="radio"
        >
          <span
            :style="{ 'background-color': color.value }"
            class="size-4 rounded-full"
          />

          {{ color.label }}
        </c-menu-item>
      </template>

      <template v-else-if="color.type === 'title'">
        <c-menu-label>{{ color.label }}</c-menu-label>
      </template>

      <template v-else-if="color.type === 'divider'">
        <c-divider />
      </template>
    </template>
  </toolbar-menu>
</template>

<script setup lang="ts">
type Entry = { label: string; type: 'title' } | { type: 'divider' } | Swatch;

type Swatch = { label: string; type: 'color'; value: string };

const colors = ref<Entry[]>([
  { label: 'CSC UI Colors', type: 'title' },
  { label: 'Primary', type: 'color', value: '#006778' },
  { label: 'Secondary', type: 'color', value: '#830051' },
  { label: 'Accent', type: 'color', value: '#00c7b2' },
  { type: 'divider' },
  { label: 'Custom Colors', type: 'title' },
  { label: 'Red', type: 'color', value: '#ff595e' },
  { label: 'Orange', type: 'color', value: '#ffca3a' },
  { label: 'Green', type: 'color', value: '#8ac926' },
  { label: 'Blue', type: 'color', value: '#1982c4' },
  { label: 'Purple', type: 'color', value: '#6a4c93' },
  { label: 'Pink', type: 'color', value: '#e500a4' },
]);

// The primary seed is shared with the customization page's playground, so a
// pick here shows up there and its "Reset to defaults" snaps this back.
const { seeds, setSeed } = useThemeSeeds();

const currentColor = computed<Swatch>(
  () =>
    colors.value.find(
      (c): c is Swatch => c.type === 'color' && c.value === seeds.primary,
    ) ?? { label: 'Custom', type: 'color', value: seeds.primary },
);

const onSelect = (event: CustomEvent<{ value: Swatch }>) =>
  setSeed('primary', event.detail.value.value);
</script>
