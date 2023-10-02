
/**
 * Examples for CProgressBar.vue.
 * Automatically generated at 10/2/2023, 8:59:00 AM.
 *
 * ⚠️ DO NOT EDIT THESE MANUALLY AS THEY WILL BE OVERWRITTEN IN THE NEXT BUILD!
 */
export const basic = `const progress = ref(25);

const interval = setInterval(() => {
  progress.value = Math.ceil(Math.random() * 100);
}, 2000);

onBeforeUnmount(() => {
  clearInterval(interval);
});
`;

