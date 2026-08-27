<docs>surface: canvas</docs>

<template>
  <div class="example-row">
    <c-navigation-button @click="menuVisible = !menuVisible" />

    <p>Menu {{ menuVisible ? 'open' : 'closed' }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const menuVisible = ref(false);
</script>
