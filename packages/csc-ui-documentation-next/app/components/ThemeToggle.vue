<template>
  <!-- Rendered client-only: the label depends on localStorage, which the
       prerendered HTML cannot know. -->
  <ClientOnly>
    <button
      :aria-label="`Color theme: ${preference}. Switch to ${next}.`"
      class="theme-toggle"
      :title="`Theme: ${preference}`"
      type="button"
      @click="cycle"
    >
      <svg aria-hidden="true" height="20" viewBox="0 0 24 24" width="20">
        <path :d="icon" fill="currentColor" />
      </svg>
      <span class="theme-toggle-label">{{ preference }}</span>
    </button>

    <template #fallback>
      <span class="theme-toggle theme-toggle-placeholder" />
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
import {
  mdiThemeLightDark,
  mdiWeatherNight,
  mdiWhiteBalanceSunny,
} from '@mdi/js';

const { cycle, preference } = useTheme();

const ICONS: Record<string, string> = {
  dark: mdiWeatherNight,
  light: mdiWhiteBalanceSunny,
  system: mdiThemeLightDark,
};

const NEXT: Record<string, string> = {
  dark: 'system',
  light: 'dark',
  system: 'light',
};

const icon = computed(() => ICONS[preference.value] ?? mdiThemeLightDark);

const next = computed(() => NEXT[preference.value] ?? 'light');
</script>
