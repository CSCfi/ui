<template>
  <div>
    <!-- `select-all` pins a row at the top of the list that picks every
         enabled option currently listed — type a query and it picks only the
         matches. `texts.selectAll` receives that count; the object is bound
         as a property because it holds a function. -->
    <c-autocomplete
      v-model="languages"
      :texts="texts"
      clearable
      hint="Type to narrow the list, then select all matches"
      label="Programming languages"
      max-tags="3"
      multiple
      placeholder="Start typing to search"
      select-all
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

      <c-option value="cobol" disabled>
        <c-option-value>COBOL</c-option-value>
      </c-option>
    </c-autocomplete>

    <p>Value: {{ languages.length ? languages.join(', ') : '[]' }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const languages = ref<string[]>(['ts']);

const texts = {
  selectAll: (count: number) => `Select all ${count} matches`,
};
</script>
