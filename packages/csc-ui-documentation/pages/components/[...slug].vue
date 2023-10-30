<template>
  <div>
    <suspense :key="slug[0]" @resolve="onResolve">
      <component-examples :component="slug[0]" />
    </suspense>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import ComponentExamples from '~/components/ComponentExamples.vue';

const { slug } = useRoute().params;

const { componentData, pageTitles } = storeToRefs(useExampleStore());

definePageMeta({
  key: (route) => route.fullPath,
});

const onResolve = () => {
  pageTitles.value = {
    title: componentData.value?.name || '',
    subtitle: componentData.value?.tag || '',
  };
};
</script>

<style lang="scss"></style>
