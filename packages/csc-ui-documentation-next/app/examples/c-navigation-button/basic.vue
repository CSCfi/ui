<template>
  <div class="example-row">
    <c-navigation-button @click="menuVisible = !menuVisible" />

    <span>Menu {{ menuVisible ? 'open' : 'closed' }}</span>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const menuVisible = ref(false);
</script>
