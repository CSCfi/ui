<template>
  <div>
    <!-- In multiple mode the value is an array in pick order. The panel stays
         open after a pick and keeps its query, so several matches can be
         picked in a row; `max-tags` folds the tags past that count into one
         "+N more" tag. -->
    <c-autocomplete
      v-model="languages"
      clearable
      hint="Type to filter, pick several"
      label="Programming languages"
      max-tags="3"
      multiple
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

      <c-option value="go">
        <c-option-value>Go</c-option-value>
      </c-option>

      <c-option value="rb">
        <c-option-value>Ruby</c-option-value>
      </c-option>
    </c-autocomplete>

    <p>Value: {{ languages.length ? languages.join(', ') : '[]' }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const languages = ref<string[]>(['ts']);
</script>
