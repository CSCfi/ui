<template>
  <div>
    <component-examples :component="slug[0]" />
  </div>
</template>

<script setup lang="ts">
import ComponentExamples from '../../components/ComponentExamples.vue';

const { slug } = useRoute().params;

definePageMeta({
  key: (route) => route.fullPath,
});
</script>

<style lang="scss"></style>
