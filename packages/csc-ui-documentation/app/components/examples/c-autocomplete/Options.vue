<template>
  <component-example rows name="options">
    <template #title>Usage with c-option elements</template>

    <template #subtitle>
      Author options declaratively; c-option-value marks the displayed label
    </template>

    <c-autocomplete
      v-model="status"
      class="max-w-90"
      label="Status"
      placeholder="Search..."
      clearable
      hide-details
    >
      <c-option value="backlog" name="Backlog">
        <div class="flex gap-2 items-center justify-between">
          Backlog

          <c-tag active flat>backlog</c-tag>
        </div>
      </c-option>

      <c-option value="todo" name="Todo">
        <div class="flex gap-2 items-center justify-between">
          Todo

          <c-tag active flat>todo</c-tag>
        </div>
      </c-option>

      <c-option value="in-progress" name="In Progress">
        <div class="flex gap-2 items-center justify-between">
          In Progress

          <c-tag active flat>in-progress</c-tag>
        </div>
      </c-option>

      <c-option value="in-review" name="In Review" disabled>
        <div class="flex gap-2 items-center justify-between">
          In Review

          <c-tag active flat>in-review</c-tag>
        </div>
      </c-option>

      <c-option value="done" name="Done">
        <div class="flex gap-2 items-center justify-between">
          Done

          <c-tag active flat>done</c-tag>
        </div>
      </c-option>
    </c-autocomplete>

    <p style="margin: 16px 0 0">
      Selected status: <c-tag flat>{{ status || 'none' }}</c-tag>
    </p>
  </component-example>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const status = ref('');
</script>
