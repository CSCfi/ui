<template>
  <component-example name="custom-width">
    <template #title>Custom width</template>

    <c-row gap="8">
      <c-button
        @click="numericWidthModal = true"
        @keyup.enter="numericWidthModal = true"
        @keyup.space="numericWidthModal = true"
      >
        Open modal with a numeric width
      </c-button>

      <c-button
        @click="stringWidthModal = true"
        @keyup.enter="stringWidthModal = true"
        @keyup.space="stringWidthModal = true"
      >
        Open modal with a width defined as string
      </c-button>
    </c-row>

    <c-modal v-model="numericWidthModal" v-control width="400">
      <c-card>
        <c-card-title>Modal (400px)</c-card-title>

        <c-card-content>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat.
        </c-card-content>

        <c-card-actions>
          <c-button
            @click="numericWidthModal = false"
            @keyup.enter="numericWidthModal = false"
            @keyup.space="numericWidthModal = false"
          >
            Close
          </c-button>
        </c-card-actions>
      </c-card>
    </c-modal>

    <c-modal v-model="stringWidthModal" v-control width="60%">
      <c-card>
        <c-card-title>Modal (60%)</c-card-title>

        <c-card-content>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat.
        </c-card-content>

        <c-card-actions>
          <c-button
            @click="stringWidthModal = false"
            @keyup.enter="stringWidthModal = false"
            @keyup.space="stringWidthModal = false"
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

const numericWidthModal = ref(false);
const stringWidthModal = ref(false);
</script>
