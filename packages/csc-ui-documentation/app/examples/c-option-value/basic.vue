<template>
  <div>
    <!-- The label lives in c-option-value; the description after it renders
         in the row but is not part of the label, so the filter matches and
         the closed field shows only "TypeScript". While a query is typed the
         runs of the label equal to it are marked (`::part(match)`). -->
    <c-autocomplete
      v-model="language"
      clearable
      hint="Only the c-option-value text is filtered, marked and used as the label"
      label="Programming language"
      placeholder="Start typing to search"
    >
      <c-option value="js">
        <c-option-value>JavaScript</c-option-value>

        <small>Web pages and Node.js</small>
      </c-option>

      <c-option value="ts">
        <c-option-value>TypeScript</c-option-value>

        <small>JavaScript with static types</small>
      </c-option>

      <c-option value="py">
        <c-option-value>Python</c-option-value>

        <small>Scripting and data science</small>
      </c-option>

      <c-option value="rs">
        <c-option-value>Rust</c-option-value>

        <small>Systems programming</small>
      </c-option>
    </c-autocomplete>

    <p>Value: {{ language ?? 'null' }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const language = ref<string | null>(null);
</script>
