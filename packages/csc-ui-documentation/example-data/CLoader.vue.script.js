
/**
 * Examples for CLoader.vue.
 * Automatically generated at 10/2/2023, 8:59:00 AM.
 *
 * ⚠️ DO NOT EDIT THESE MANUALLY AS THEY WILL BE OVERWRITTEN IN THE NEXT BUILD!
 */
export const basic = `const loader = ref(false);

const startLoader = () => {
  loader.value = true;

  setTimeout(() => {
    loader.value = false;
  }, 5000);
};
`;

export const delayed = `const loader = ref(false);

const startLoader = () => {
  loader.value = true;

  setTimeout(() => {
    loader.value = false;
  }, 5000);
};
`;
