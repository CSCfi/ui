const e=`
import { ref } from 'vue';
const createTags = () => {
  return [
    { id: 1, label: 'Tag One', active: false },
    { id: 2, label: 'Tag Two', active: false },
    { id: 3, label: 'Tag Three', active: false },
  ];
};

const tags = ref(createTags());

const onRemoveTag = (id: number) => {
  tags.value = tags.value.filter((tag) => tag.id !== id);
};

const onResetTags = () => {
  tags.value = createTags();
};
`;export{e as default};
