const e=`
import { ref } from 'vue';
const activeTags = ref([false, true, false]);

const onToggleActive = (index: number) => {
  activeTags.value[index] = !activeTags.value[index];
};
`;export{e as default};
