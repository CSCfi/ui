<template>
  <c-card>
    <c-card-title>kakka</c-card-title>

    <c-card-content>
      <c-text-field v-model="esko" label="Esko"></c-text-field>

      {{ esko }}
    </c-card-content>
  </c-card>
</template>

<script lang="ts" setup>
import { ref }  from 'vue';

const esko = ref('Nakkena taas');
</script>
