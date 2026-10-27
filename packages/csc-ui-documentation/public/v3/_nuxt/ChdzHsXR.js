const e=`
import { ref } from 'vue';
const progress = ref(25);

const interval = setInterval(() => {
  progress.value = Math.ceil(Math.random() * 100);
}, 2000);

onBeforeUnmount(() => {
  clearInterval(interval);
});
`;export{e as default};
