<template>
  <component-example name="small">
    <template #title>Small variant</template>

    <c-tags size="small">
      <c-tag :active="activeTags[0]" badge="8" @click="onToggleActive(0)">
        One
      </c-tag>

      <c-tag :active="activeTags[1]" @click="onToggleActive(1)">Two</c-tag>

      <c-tag :active="activeTags[2]" @click="onToggleActive(2)">Three</c-tag>
    </c-tags>
  </component-example>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const activeTags = ref([false, true, false]);

const onToggleActive = (index: number) => {
  activeTags.value[index] = !activeTags.value[index];
};
</script>
