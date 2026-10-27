const e=`
import { ref } from 'vue';
const loader = ref(false);

const startLoader = () => {
  loader.value = true;

  setTimeout(() => {
    loader.value = false;
  }, 5000);
};
`;export{e as default};
