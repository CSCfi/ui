
/**
 * Examples for CTags.vue.
 * Automatically generated at 10/2/2023, 2:21:28 PM.
 *
 * ⚠️ DO NOT EDIT THESE MANUALLY AS THEY WILL BE OVERWRITTEN IN THE NEXT BUILD!
 */
export const basic = `const active = ref([false, true, false]);

const toggleActive = (index: number) => {
  active.value[index] = !active.value[index];
};
`;

export const closeable = `const createTags = () => {
  return [
    { id: 1, label: 'Tag One', active: false },
    { id: 2, label: 'Tag Two', active: false },
    { id: 3, label: 'Tag Three', active: false },
  ];
};

const tags = ref(createTags());

const removeTag = (id: number) => {
  tags.value = tags.value.filter((tag) => tag.id !== id);
};

const resetTags = () => {
  tags.value = createTags();
};
`;

