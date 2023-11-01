import { storeToRefs } from 'pinia';

export const usePageTitles = () => {
  const { componentData, pageTitles } = storeToRefs(useExampleStore());

  defineOptions({
    inheritAttrs: false,
  });

  onMounted(() => {
    pageTitles.value = {
      title: componentData.value?.name || '',
      subtitle: componentData.value?.tag || '',
    };
  });
};
