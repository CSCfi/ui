<template>
  <div>
    <!-- Toasts are normally created by c-toasts, which renders a c-toast for
         each message. A persistent message can be shown standalone. -->
    <c-toast :message />
  </div>
</template>

<script setup lang="ts">
const message = {
  id: 'example',
  message: 'Your changes have been saved.',
  persistent: true,
  title: 'Saved',
  type: 'success',
};
</script>
