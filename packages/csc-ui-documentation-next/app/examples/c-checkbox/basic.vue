<template>
  <div class="example-row">
    <c-checkbox
      :checked.prop="subscribed"
      hint="You can unsubscribe at any time"
      @changeValue="onChange"
    >
      Subscribe to the newsletter
    </c-checkbox>

    <span>Value: {{ subscribed }}</span>
  </div>
</template>

<script setup lang="ts">
const subscribed = ref(false);

const onChange = (event: Event) => {
  subscribed.value = (event as CustomEvent<boolean>).detail;
};
</script>
