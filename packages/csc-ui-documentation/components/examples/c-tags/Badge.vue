<template>
  <component-example name="badge">
    <template #title>Usage with badges</template>

    <c-tags>
      <c-tag :active="activeTags[0]" badge="0" @click="onToggleActive(0)">
        One
      </c-tag>

      <c-tag :active="activeTags[1]" badge="125" @click="onToggleActive(1)">
        Two
      </c-tag>

      <c-tag :active="activeTags[2]" badge="9" @click="onToggleActive(2)">
        Three
      </c-tag>
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
