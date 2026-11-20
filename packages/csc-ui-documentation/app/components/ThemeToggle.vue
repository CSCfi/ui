<template>
  <!-- Rendered client-only: the label depends on localStorage, which the
       prerendered HTML cannot know. The fallback holds the trigger's place
       at both of ToolbarMenu's sizes. -->
  <client-only>
    <template #fallback>
      <span
        class="invisible inline-flex min-w-22 items-center gap-[0.4rem] rounded-full border px-3 py-1 text-[0.8125rem] max-md:hidden"
      />

      <span class="invisible size-8 md:hidden" />
    </template>

    <toolbar-menu
      :label="`Color theme: ${preference}`"
      :text="label"
      @select="onSelect"
    >
      <template #icon="{ compact }">
        <c-icon :path="icon" :size="compact ? undefined : 20" />
      </template>

      <c-menu-label>Theme</c-menu-label>

      <c-menu-item
        v-for="option in THEME_OPTIONS"
        :key="option.id"
        :checked="option.id === preference"
        :value="option.id"
        type="radio"
      >
        <c-icon :path="option.icon" :size="16" />
        {{ option.label }}
      </c-menu-item>
    </toolbar-menu>
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

type ThemeOption = { icon: string; id: ThemePreference; label: string };

const THEME_OPTIONS: ThemeOption[] = [
  { icon: mdiWeatherNight, id: 'dark', label: 'Dark' },
  { icon: mdiWhiteBalanceSunny, id: 'light', label: 'Light' },
  { icon: mdiThemeLightDark, id: 'system', label: 'System' },
];

const icon = computed(() => ICONS[preference.value] ?? mdiThemeLightDark);

const label = computed(
  () =>
    THEME_OPTIONS.find((option) => option.id === preference.value)?.label ??
    preference.value,
);

const onSelect = (event: CustomEvent<{ value: ThemePreference }>) => {
  setPreference(event.detail.value);
};
</script>

<style scoped>
c-icon::part(root) {
  color: var(--c-primary);
}
</style>
