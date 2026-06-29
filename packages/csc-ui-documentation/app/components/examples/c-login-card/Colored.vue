<template>
  <component-example name="colored">
    <template #title>Colored overlay for the background image</template>

    <template #subtitle>With css background-blend-modes</template>

    <c-login-card
      background-position="50% 0%"
      class="secondary-card"
      src="/img/wall2.jpg"
      :overlay="showOverlay"
      :overlay-blend-mode="blendMode"
    >
      <c-login-card-title>Login to a service</c-login-card-title>

      <c-login-card-content>
        <div>
          Service name provides a platform for you to host your own applications
          and make them accessible over the web.
        </div>

        <c-text-field label="Username" />

        <c-text-field
          hint="Please do not use numbers in your password"
          label="Password"
          type="password"
        />
      </c-login-card-content>

      <c-login-card-actions justify="space-between">
        <c-button size="large">Submit</c-button>
      </c-login-card-actions>

      <c-link href="http://csc.fi" underline>Forgot password?</c-link>
    </c-login-card>

    <flex class="flex gap-2">
      <c-button @click="showOverlay = !showOverlay">Toggle overlay</c-button>

      <c-select
        v-model="blendMode"
        :items="blendModes"
        label="Overlay blend mode"
        hide-details
      />
    </flex>
  </component-example>
</template>

<script setup lang="ts">
import { ref } from 'vue';

import type { CSelectItem } from '@cscfi/csc-ui';

const blendModes: CSelectItem[] = [
  { value: 'normal', name: 'normal' },
  { value: 'multiply', name: 'multiply' },
  { value: 'screen', name: 'screen' },
  { value: 'overlay', name: 'overlay' },
  { value: 'darken', name: 'darken' },
  { value: 'lighten', name: 'lighten' },
  { value: 'color-dodge', name: 'color-dodge' },
  { value: 'color-burn', name: 'color-burn' },
  { value: 'hard-light', name: 'hard-light' },
  { value: 'soft-light', name: 'soft-light' },
  { value: 'difference', name: 'difference' },
  { value: 'exclusion', name: 'exclusion' },
  { value: 'hue', name: 'hue' },
  { value: 'saturation', name: 'saturation' },
  { value: 'color', name: 'color' },
  { value: 'luminosity', name: 'luminosity' },
];

const blendMode = ref('multiply');

const showOverlay = ref(true);
</script>

<style>
c-login-card.secondary-card::part(image) {
  background-color: var(--c-secondary-500);
}

c-login-card.secondary-card c-button::part(root) {
  background-color: var(--c-secondary-500);
}

c-login-card.secondary-card c-login-card-title::part(root) {
  color: var(--c-secondary-500);
}
</style>
