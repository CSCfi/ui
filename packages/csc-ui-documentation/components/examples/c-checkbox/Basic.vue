<template>
  <component-example rows name="basic">
    <template #title>Basic usage</template>

    <c-checkbox
      v-model="checkbox1"
      v-control
      true-value="on"
      false-value="off"
      hide-details
    >
      Value as string: {{ checkbox1 }}
    </c-checkbox>

    <c-checkbox v-model="checkbox2" v-control hide-details>
      {{ checkbox2 ? 'Checked' : 'Unchecked' }}
    </c-checkbox>

    <c-checkbox label="Label as a prop" hide-details />

    <c-checkbox v-model="checkbox3" v-control disabled hide-details>
      Disabled, checked
    </c-checkbox>

    <c-checkbox disabled hide-details>Disabled</c-checkbox>

    <c-checkbox hint="This should be checked" required>
      Required with hint
    </c-checkbox>

    <c-checkbox
      v-model="requiredInput"
      v-control
      :valid="requiredInput"
      validation="This input has an error"
      hint="Uncheck to return to the error state"
      required
    >
      Error state
    </c-checkbox>

    <c-checkbox hint="Please agree to the terms and conditions">
      I agree to the
      <c-link href="https://csc.fi" underline>terms and conditions</c-link>
    </c-checkbox>
  </component-example>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const checkbox1 = ref('on');

const checkbox2 = ref(true);

const checkbox3 = ref(true);

const requiredInput = ref(false);
</script>
