<template>
  <component-example name="basic">
    <template #title>Basic usage</template>

    <c-button
      @click="basicModal = true"
      @keyup.enter="basicModal = true"
      @keyup.space="basicModal = true"
    >
      Open modal
    </c-button>

    <c-modal v-model="basicModal" v-control>
      <c-card>
        <c-card-title>Modal</c-card-title>

        <c-card-content>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat.
        </c-card-content>

        <c-card-actions>
          <c-button
            @click="basicModal = false"
            @keyup.enter="basicModal = false"
            @keyup.space="basicModal = false"
          >
            Close
          </c-button>
        </c-card-actions>
      </c-card>
    </c-modal>
  </component-example>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const basicModal = ref(false);
</script>
