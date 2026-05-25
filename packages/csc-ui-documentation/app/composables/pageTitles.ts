import { storeToRefs } from 'pinia';

export const usePageTitles = () => {
  const { componentData, pageTitles } = storeToRefs(useExampleStore());

  onMounted(() => {
    pageTitles.value = {
      title: componentData.value?.name || '',
      subtitle: componentData.value?.tag || '',
    };
  });
};
