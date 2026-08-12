// Adopt the persisted flavor only after hydration: the prerendered HTML
// always shows the Vue default, and flipping the ref before Vue hydrates
// would mismatch every example tablist.
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('app:mounted', () => {
    initFlavorFromStorage();
  });
});
