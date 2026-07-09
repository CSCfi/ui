<template>
  <div class="example-grid">
    <c-tags>
      <c-tag
        v-for="topic in topics"
        :key="topic.id"
        :active="topic.active"
        closeable
        @click="topic.active = !topic.active"
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
const createTopics = () => {
  return [
    { id: 'biosciences', label: 'Biosciences', active: false },
    { id: 'chemistry', label: 'Chemistry', active: false },
    { id: 'physics', label: 'Physics', active: false },
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
