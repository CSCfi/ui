<template>
  <div>
    <c-autocomplete
      v-model="language"
      clearable
      hint="c-option-value marks the text that gets match highlighting"
      label="Programming language"
      placeholder="Start typing to search"
    >
      <c-option value="js">
        <c-option-value>JavaScript</c-option-value>
      </c-option>

      <c-option value="ts">
        <c-option-value>TypeScript</c-option-value>
      </c-option>

      <c-option value="py">
        <c-option-value>Python</c-option-value>
      </c-option>

      <c-option value="rs">
        <c-option-value>Rust</c-option-value>
      </c-option>
    </c-autocomplete>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const language = ref<string | null>(null);
</script>
