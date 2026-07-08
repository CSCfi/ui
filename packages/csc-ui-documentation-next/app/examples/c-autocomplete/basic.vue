<template>
  <div>
    <c-autocomplete
      :value.prop="language"
      clearable
      hint="Type to filter the options"
      label="Programming language"
      placeholder="Start typing to search"
      @change-value="onChange"
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

    <span>Value: {{ language ?? 'null' }}</span>
  </div>
</template>

<script setup lang="ts">
const language = ref<string | null>(null);

const onChange = (event: Event) => {
  language.value = (event as CustomEvent<string | null>).detail;
};
</script>
