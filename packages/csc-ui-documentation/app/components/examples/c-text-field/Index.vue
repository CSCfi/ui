<template>
  <basic />

  <date />

  <password />

  <shadow />

  <slots />

  <textarea-example />

  <status />

  <label-on-top />
</template>

<script setup lang="ts">
import Basic from './Basic.vue';
import Date from './Date.vue';
import Password from './Password.vue';
import Shadow from './Shadow.vue';
import Slots from './Slots.vue';
import TextareaExample from './Textarea.vue';
import Status from './Status.vue';
import LabelOnTop from './LabelOnTop.vue';

defineOptions({
  inheritAttrs: false,
});

usePageTitles();
</script>
