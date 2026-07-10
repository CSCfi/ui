<template>
  <div class="example-row">
    <c-button-group v-model="toppings" label="Toppings" multiple>
      <c-button value="cheese">Cheese</c-button>

      <c-button value="pepperoni">Pepperoni</c-button>

      <c-button value="mushroom">Mushroom</c-button>
    </c-button-group>

    <span>Selected: {{ toppings.length ? toppings.join(', ') : 'none' }}</span>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const toppings = ref<string[]>(['cheese']);
</script>
