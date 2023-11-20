<template>
  <basic />

  <date />

  <password />

  <shadow />

  <slots />

  <textarea-example />

  <status />
</template>

<script setup lang="ts">
import Basic from './Basic.vue';
import Date from './Date.vue';
import Password from './Password.vue';
import Shadow from './Shadow.vue';
import Slots from './Slots.vue';
import TextareaExample from './Textarea.vue';
import Status from './Status.vue';

defineOptions({
  inheritAttrs: false,
});

usePageTitles();
</script>
