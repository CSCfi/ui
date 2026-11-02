const e=`
import { ref } from 'vue';import { mdiVolumeHigh, mdiVolumeLow } from '@mdi/js';

const volume = ref(80);

const onVolumeDecrease = () => {
  volume.value = Math.max(0, volume.value - 10);
};

const onVolumeIncrease = () => {
  volume.value = Math.min(100, volume.value + 10);
};
`;export{e as default};
