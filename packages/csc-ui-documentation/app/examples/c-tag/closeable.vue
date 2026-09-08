<template>
  <div class="example-grid">
    <!-- A closeable tag's close button is its only control; it emits `close`. -->
    <c-tags>
      <c-tag
        v-for="topic in topics"
        :key="topic.id"
        closeable
        @close="onRemoveTopic(topic.id)"
      >
        {{ topic.label }}
      </c-tag>
    </c-tags>

    <div>
      <c-button @click="onResetTopics()">Reset topics</c-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const createTopics = () => {
  return [
    { id: 'biosciences', label: 'Biosciences' },
    { id: 'chemistry', label: 'Chemistry' },
    { id: 'physics', label: 'Physics' },
  ];
};

const topics = ref(createTopics());

const onRemoveTopic = (topic: string) => {
  topics.value = topics.value.filter((t) => t.id !== topic);
};

const onResetTopics = () => {
  topics.value = createTopics();
};
</script>
