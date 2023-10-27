<template>
  <component-example rows>
    <template #title>Closeable</template>

    <c-tags>
      <c-tag
        v-for="tag in tags"
        :key="tag.id"
        :active="tag.active"
        closeable
        @click="tag.active = !tag.active"
        @close="onRemoveTag(tag.id)"
      >
        {{ tag.label }}
      </c-tag>
    </c-tags>

    <div>
      <c-button @click="onResetTags()">Reset tags</c-button>
    </div>
  </component-example>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const createTags = () => {
  return [
    { id: 1, label: 'Tag One', active: false },
    { id: 2, label: 'Tag Two', active: false },
    { id: 3, label: 'Tag Three', active: false },
  ];
};

const tags = ref(createTags());

const onRemoveTag = (id: number) => {
  tags.value = tags.value.filter((tag) => tag.id !== id);
};

const onResetTags = () => {
  tags.value = createTags();
};
</script>
