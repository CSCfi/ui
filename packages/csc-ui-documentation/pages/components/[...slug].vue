<template>
  <component-examples :component="slug[0]"></component-examples>
</template>

<script setup lang="ts">
import ComponentExamples from '~/components/ComponentExamples.vue';

const { slug } = useRoute().params;
</script>

<style lang="scss"></style>
