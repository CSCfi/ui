<template>
  <div class="example-row">
    <c-menu @select="onTheme">
      <c-button slot="trigger" text>
        <c-icon :path="mdiThemeLightDark" />
        Theme: {{ theme }}
        <c-icon :path="mdiChevronDown" />
      </c-button>

      <c-menu-label>Theme</c-menu-label>

      <c-menu-item
        v-for="option in themes"
        :key="option.value"
        :checked="theme === option.value"
        :value="option.value"
        type="radio"
      >
        <c-icon slot="icon" :path="option.icon" />
        {{ option.label }}
      </c-menu-item>
    </c-menu>
  </div>
</template>

<script setup lang="ts">
import {
  mdiChevronDown,
  mdiMonitor,
  mdiThemeLightDark,
  mdiWeatherNight,
  mdiWeatherSunny,
} from '@mdi/js';
import { ref } from 'vue';

const themes = [
  { icon: mdiWeatherNight, label: 'Dark', value: 'dark' },
  { icon: mdiWeatherSunny, label: 'Light', value: 'light' },
  { icon: mdiMonitor, label: 'System', value: 'system' },
];

const theme = ref('dark');

const onTheme = (event: Event) => {
  theme.value = (event as CustomEvent<{ value: string }>).detail.value;
};
</script>
