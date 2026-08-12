<template>
  <div>
    <!-- Toasts are normally created by c-toasts, which renders a c-toast for
         each message. A persistent message can be shown standalone. -->
    <c-toast :message.prop="message" />
  </div>
</template>

<script setup lang="ts">
const message = {
  id: 'example',
  title: 'Saved',
  message: 'Your changes have been saved.',
  type: 'success',
  persistent: true,
};
</script>
