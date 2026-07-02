<template>
  <div class="example-row">
    <c-tags>
      <c-tag
        v-for="topic in topics"
        :key="topic"
        closeable
        @close="remove(topic)"
      >
        {{ topic }}
      </c-tag>
    </c-tags>
  </div>
</template>

<script setup lang="ts">
const topics = ref(['Biosciences', 'Chemistry', 'Physics']);

const remove = (topic: string) => {
  topics.value = topics.value.filter((t) => t !== topic);
};
</script>
