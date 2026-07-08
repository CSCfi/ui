<template>
  <div class="example-row">
    <c-button @click="open = true">Open modal</c-button>

    <c-modal :value.prop="open" dismissable @change-value="open = false">
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
const open = ref(false);
</script>
