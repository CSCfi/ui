<template>
  <component-example name="basic" rows>
    <template #title>Basic usage</template>

    <c-steps v-model="step">
      <c-step>Step number 1</c-step>

      <c-step>Step number 2</c-step>

      <c-step>Step number 3</c-step>

      <c-step>Step number 4</c-step>
    </c-steps>

    <c-row gap="4">
      <c-icon-button :disabled="step === min" @click="move('<')">
        <c-icon :path="mdiChevronLeft" />
      </c-icon-button>

      <c-icon-button :disabled="step === max" @click="move('>')">
        <c-icon :path="mdiChevronRight" />
      </c-icon-button>
    </c-row>
  </component-example>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { mdiChevronLeft, mdiChevronRight } from '@mdi/js';

const step = ref(1);

const min = 1;

const max = 5;

const move = (direction: string) => {
  if (direction === '>' && step.value < max) {
    step.value += 1;
  }

  if (direction === '<' && step.value > min) {
    step.value -= 1;
  }
};
</script>
