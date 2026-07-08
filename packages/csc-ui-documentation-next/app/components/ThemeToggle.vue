<template>
  <!-- Rendered client-only: the label depends on localStorage, which the
       prerendered HTML cannot know. -->
  <client-only>
    <template #fallback>
      <span
        class="invisible inline-flex min-w-22 items-center gap-[0.4rem] rounded-full border px-3 py-1 text-[0.8125rem]"
      />
    </template>

    <c-menu position="bottom-end" @select="onSelect">
      <c-button
        slot="trigger"
        :aria-label="`Color theme: ${preference}`"
        size="small"
        text
      >
        <c-icon aria-hidden="true" :path="icon" :size="20" />

        <span class="capitalize">{{ preference }}</span>
      </c-button>

      <c-menu-label>Theme</c-menu-label>

      <c-menu-item
        v-for="option in THEME_OPTIONS"
        :key="option.id"
        :value="option.id"
      >
        <c-icon :path="option.icon" :size="16" />
        {{ option.label }}
      </c-menu-item>
    </c-menu>
  </client-only>
</template>

<script setup lang="ts">
import {
  mdiThemeLightDark,
  mdiWeatherNight,
  mdiWhiteBalanceSunny,
} from '@mdi/js';

const { preference, setPreference } = useTheme();

const ICONS = {
  dark: mdiWeatherNight,
  light: mdiWhiteBalanceSunny,
  system: mdiThemeLightDark,
} as const;

type ThemeOption = { id: ThemePreference; label: string; icon: string };

const THEME_OPTIONS: ThemeOption[] = [
  { id: 'dark', label: 'Dark', icon: mdiWeatherNight },
  { id: 'light', label: 'Light', icon: mdiWhiteBalanceSunny },
  { id: 'system', label: 'System', icon: mdiThemeLightDark },
];

const icon = computed(() => ICONS[preference.value] ?? mdiThemeLightDark);

const onSelect = (event: CustomEvent<{ value: ThemePreference }>) => {
  setPreference(event.detail.value);
};
</script>

<style scoped>
c-button::part(root) {
  color: var(--c-on-surface);
}

c-icon::part(root) {
  color: var(--c-primary);
}
</style>
