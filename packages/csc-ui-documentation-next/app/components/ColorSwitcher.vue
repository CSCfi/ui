
<template>
<c-menu position="bottom-end" @select="onSelect">
  <c-button slot="trigger" size="small" text>
    <span class="size-3 rounded-full" :style="{ 'background-color': currentColor.value }"></span>

    {{ currentColor.label }}
  </c-button>

  <template v-for="color in colors" :key="color.value">
    <template v-if="color.type === 'color'">
      <c-menu-item :value="color">
        <span class="size-4 rounded-full" :style="{ 'background-color': color.value }" />
        <span class="text-accent">{{ color.label }}</span>
      </c-menu-item>
    </template>

    <template v-else-if="color.type === 'title'">
      <c-menu-label>{{ color.label }}</c-menu-label>
    </template>

    <template v-else-if="color.type === 'divider'">
      <c-divider></c-divider>
    </template>
  </template>
</c-menu>
</template>

<script setup lang="ts">
import { applyTheme } from '@cscfi/csc-ui-next';

const colors = ref([
  { type: 'title', label: 'CSC UI Colors' },
  { type: 'color', value: '#006778', label: 'Primary' },
  { type: 'color', value: '#830051', label: 'Secondary' },
  { type: 'color', value: '#00c7b2', label: 'Accent' },
  { type: 'divider' },
  { type: 'title', label: 'Custom Colors' },
  { type: 'color', value: '#ff595e', label: 'Red' },
  { type: 'color', value: '#ffca3a', label: 'Orange' },
  { type: 'color', value: '#8ac926', label: 'Green' },
  { type: 'color', value: '#1982c4', label: 'Blue' },
  { type: 'color', value: '#6a4c93', label: 'Purple' },
  { type: 'color', value: '#e500a4', label: 'Pink' },
]);

const currentColor = ref({ type: 'color', value: '#006778', label: 'Primary' });

const onSelect = (event: CustomEvent<{ value: { type: 'color', value: string, label: string } }>) => {
  console.log(event.detail.value);
  currentColor.value = event.detail.value;

  console.log('current color', currentColor.value);

  applyTheme({ primary: event.detail.value.value });
};
</script>

<style scoped>
c-button::part(root) {
  color: var(--c-on-surface);
}

c-menu::part(panel) {
  inset: 8px 0;
}
</style>
