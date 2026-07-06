<template>
  <div class="example-row">
    <c-switch v-model="enabled">
      Notifications
    </c-switch>

    <span>Value: {{ enabled }}</span>
  </div>
</template>

<script setup lang="ts">
const enabled = ref(false);
</script>
