export type ThemePreference = 'dark' | 'light' | 'system';

export const THEME_STORAGE_KEY = 'csc-ui-docs-theme';

// Shared across all component instances; initialized from localStorage by the
// theme client plugin (the pre-paint inline script in nuxt.config.ts has
// already set the data-theme attribute by then, so there is no flash).
const preference = ref<ThemePreference>('system');

const apply = (value: ThemePreference) => {
  const root = document.documentElement;

  // No attribute = follow the OS preference (the tokens.css default);
  // an explicit data-theme wins over it.
  if (value === 'system') {
    root.removeAttribute('data-theme');
  } else {
    root.setAttribute('data-theme', value);
  }
};

export const useTheme = () => {
  const setPreference = (value: ThemePreference) => {
    preference.value = value;

    if (import.meta.client) {
      apply(value);
      localStorage.setItem(THEME_STORAGE_KEY, value);
    }
  };

  return {
    preference: readonly(preference),
    setPreference,
  };
};

/**
 * Client-plugin hook: sync the ref with the stored preference — and re-apply
 * the attribute. The pre-paint inline script (nuxt.config.ts) normally has
 * already set it, so this is an idempotent no-op; but if the two ever drift
 * (it happened: the script once read a stale storage key and reloads silently
 * fell back to the OS preference), this keeps the stored choice honored.
 */
export const initThemeFromStorage = () => {
  const stored = localStorage.getItem(THEME_STORAGE_KEY);

  if (stored === 'dark' || stored === 'light') {
    preference.value = stored;
    apply(stored);
  }
};
