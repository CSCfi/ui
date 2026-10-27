const e=`
import { ref } from 'vue';
const cardRef = ref<HTMLCCardElement | null>(null);

const onConfirm = () => {
  cardRef.value?.exitFullscreen();
};
`;export{e as default};
