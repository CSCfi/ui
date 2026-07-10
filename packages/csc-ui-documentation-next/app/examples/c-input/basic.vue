<template>
  <div>
    <c-input
      :filled.prop="query.length > 0"
      hint="c-input is the field shell — you provide the native input"
      input-id="example-search"
      label="Search"
    >
      <input id="example-search" v-model="query" type="text" />
    </c-input>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const query = ref('');
</script>
