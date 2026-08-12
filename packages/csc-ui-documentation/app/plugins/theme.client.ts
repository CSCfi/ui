// The inline head script (nuxt.config.ts) applies the stored theme before
// first paint; this only syncs the Vue-side ref so the toggle shows the
// right state.
export default defineNuxtPlugin(() => {
  initThemeFromStorage();
});
