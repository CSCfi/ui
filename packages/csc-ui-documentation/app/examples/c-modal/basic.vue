<template>
  <div class="example-row">
    <c-button @click="open = true">Open modal</c-button>

    <c-modal v-model="open" dismissable>
      <c-card>
        <c-card-title>Delete project</c-card-title>

        <c-card-content>
          <p>This action cannot be undone.</p>
        </c-card-content>

        <c-card-actions justify="end">
          <c-button text @click="open = false">Cancel</c-button>

          <c-button danger @click="open = false">Delete</c-button>
        </c-card-actions>
      </c-card>
    </c-modal>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const open = ref(false);
</script>
