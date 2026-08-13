<template>
  <div class="example-row">
    <c-button-group v-model="align" label="Alignment" mandatory>
      <c-button value="left">Left</c-button>

      <c-button value="center">Center</c-button>

      <c-button value="right">Right</c-button>
    </c-button-group>

    <p>Selected: {{ align }} — the active button cannot be toggled off</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const align = ref('left');
</script>
