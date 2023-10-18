<template>
  <component-example name="mobile" rows>
    <template #title>Mobile labels</template>

    <c-card style="max-width: 520px">
      <c-card-title>Mobile labels</c-card-title>

      <c-card-content>
        <c-steps v-model="step" v-control>
          <c-step>Step number 1</c-step>
          <c-step>Step number 2</c-step>
          <c-step>Step number 3</c-step>
          <c-step>Step number 4</c-step>
        </c-steps>
      </c-card-content>

      <c-card-actions justify="center">
        <c-icon-button :disabled="step === min" @click="move('<')">
          <c-icon :path="mdiChevronLeft" />
        </c-icon-button>

        <c-icon-button :disabled="step === max" @click="move('>')">
          <c-icon :path="mdiChevronRight" />
        </c-icon-button>
      </c-card-actions>
    </c-card>
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
