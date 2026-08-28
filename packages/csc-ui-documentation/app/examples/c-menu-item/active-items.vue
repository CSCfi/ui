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
        :active.prop="theme === 'dark'"
        :icon="mdiWeatherNight"
        value="dark"
      >
        Dark
      </c-menu-item>

      <c-menu-item
        :active.prop="theme === 'light'"
        :icon="mdiWeatherSunny"
        value="light"
      >
        Light
      </c-menu-item>

      <c-menu-item
        :active.prop="theme === 'system'"
        :icon="mdiMonitor"
        value="system"
      >
        System
      </c-menu-item>
    </c-menu>

    <c-menu @select="onSort">
      <c-button slot="trigger" text>
        Sort by: {{ sortBy }}
        <c-icon :path="mdiChevronDown" />
      </c-button>

      <c-menu-item
        v-for="key in sortKeys"
        :key="key"
        :active.prop="sortBy === key"
        :active-icon="mdiRadioboxMarked"
        :value="key"
      >
        {{ key }}
      </c-menu-item>
    </c-menu>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

import {
  mdiChevronDown,
  mdiMonitor,
  mdiRadioboxMarked,
  mdiThemeLightDark,
  mdiWeatherNight,
  mdiWeatherSunny,
} from '@mdi/js';

const theme = ref('dark');

const sortKeys = ['name', 'size', 'date'];

const sortBy = ref('name');

const onTheme = (event: Event) => {
  theme.value = (event as CustomEvent<{ value: string }>).detail.value;
};

const onSort = (event: Event) => {
  sortBy.value = (event as CustomEvent<{ value: string }>).detail.value;
};
</script>
