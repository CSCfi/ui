<template>
  <div class="example-row">
    <c-checkbox v-model="subscribed" hint="You can unsubscribe at any time">
      Subscribe to the newsletter
    </c-checkbox>

    <p>Value: {{ subscribed }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const subscribed = ref(false);
</script>
