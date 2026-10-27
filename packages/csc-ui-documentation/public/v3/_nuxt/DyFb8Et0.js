const e=`
import { ref } from 'vue';import countries from '../../data/countries.json';

const items = computed(() => {
  return Object.entries(countries).map(([value, name]) => ({
    name,
    value,
  }));
});

const value = ref(null);
`;export{e as default};
