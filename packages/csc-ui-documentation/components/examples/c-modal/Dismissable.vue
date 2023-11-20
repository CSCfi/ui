<template>
  <component-example name="dismissable">
    <template #title>Dismissable</template>

    <template #subtitle>
      With fullscreen toggle and without backdrop blur
    </template>

    <c-button
      @click="dismissableModal = true"
      @keyup.enter="dismissableModal = true"
      @keyup.space="dismissableModal = true"
    >
      Open dismissable modal
    </c-button>

    <c-modal
      v-model="dismissableModal"
      v-control
      dismissable
      disable-backdrop-blur
    >
      <c-card fullscreen>
        <c-card-title>Dismissable</c-card-title>

        <c-card-content>
          <div>This modal can be dismissed by clicking outside the content</div>

          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat.
        </c-card-content>

        <c-card-actions justify="end">
          <c-button
            @click="dismissableModal = false"
            @keyup.enter="dismissableModal = false"
            @keyup.space="dismissableModal = false"
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

const dismissableModal = ref(false);
</script>
