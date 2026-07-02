<template>
  <div class="example-row">
    <c-switch :value.prop="enabled" @changeValue="onChange">
      Notifications
    </c-switch>

    <span>Value: {{ enabled }}</span>
  </div>
</template>

<script setup lang="ts">
const enabled = ref(false);

const onChange = (event: Event) => {
  enabled.value = (event as CustomEvent<boolean>).detail;
};
</script>
