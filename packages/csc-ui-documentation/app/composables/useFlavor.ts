import { mdiAngular, mdiLanguageTypescript, mdiReact, mdiVuejs } from '@mdi/js';

/**
 * The documentation-wide flavor: which consumption dialect (Vue | React |
 * Angular | TypeScript) every example tab, getting-started block, and the
 * header switcher show. One global selection — clicking any
 * example tab switches the whole site.
 */
export type Flavor = 'angular' | 'react' | 'typescript' | 'vue';

export const FLAVOR_STORAGE_KEY = 'csc-docs-flavor';

export const ICONS: Record<Flavor, string> = {
  angular: mdiAngular,
  react: mdiReact,
  typescript: mdiLanguageTypescript,
  vue: mdiVuejs,
};

export const ICON_COLORS: Record<Flavor, string> = {
  angular: 'text-[#dd0031]',
  react: 'text-[#61dafb]',
  typescript: 'text-[#3178c6]',
  vue: 'text-[#42b883]',
};

/** Canonical display order: the Vue canon first, then overrides. */
export const FLAVORS: ReadonlyArray<{
  icon: string;
  id: Flavor;
  label: string;
}> = [
  { icon: ICONS.vue, id: 'vue', label: 'Vue' },
  { icon: ICONS.react, id: 'react', label: 'React' },
  { icon: ICONS.angular, id: 'angular', label: 'Angular' },
  { icon: ICONS.typescript, id: 'typescript', label: 'TypeScript' },
];

export const isFlavor = (value: unknown): value is Flavor =>
  FLAVORS.some((flavor) => flavor.id === value);

// Shared across all component instances (the useTheme singleton pattern).
// SSR/prerender always renders the Vue default; the client plugin syncs the
// stored choice after hydration — a brief default-tab flash instead of a
// hydration mismatch (unlike theme there is no pre-paint inline script,
// because the active tab lives in Vue state, not in a root attribute).
const flavor = ref<Flavor>('vue');

export const useFlavor = () => {
  const setFlavor = (value: Flavor) => {
    flavor.value = value;

    if (import.meta.client) {
      localStorage.setItem(FLAVOR_STORAGE_KEY, value);
    }
  };

  return {
    flavor: readonly(flavor),
    setFlavor,
  };
};

/** Client-plugin hook: adopt the persisted selection (post-hydration). */
export const initFlavorFromStorage = () => {
  const stored = localStorage.getItem(FLAVOR_STORAGE_KEY);

  if (isFlavor(stored)) {
    flavor.value = stored;
  }
};
