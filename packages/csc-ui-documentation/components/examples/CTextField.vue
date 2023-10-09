<template>
  <component-example name="basic" rows>
    <template #title>Basic usage</template>

    <c-text-field label="Text field" />
  </component-example>

  <component-example name="date" rows>
    <template #title>Date field</template>

    <c-text-field label="Date field" type="date" />
  </component-example>

  <component-example name="password" rows>
    <template #title>Password field</template>

    <c-text-field label="Password field" type="password" />
  </component-example>

  <component-example name="shadow" rows>
    <template #title>Shadow variant</template>

    <c-text-field placeholder="Shadow field" shadow />
  </component-example>

  <component-example name="slots" rows>
    <template #title>Slots</template>

    <c-text-field placeholder="Search for something..." shadow>
      <c-icon slot="pre" :path="mdiMagnify" size="16" />

      <c-button slot="post" size="small" ghost>Search</c-button>
    </c-text-field>

    <c-text-field v-model="clearableValue" v-control label="Clearable">
      <c-icon-button slot="post" size="x-small" text @click="onClear()">
        <c-icon :path="mdiClose" />
      </c-icon-button>
    </c-text-field>
  </component-example>

  <component-example name="textarea" rows>
    <template #title>Textarea</template>

    <c-text-field
      label="I am a textarea"
      placeholder="I have a placeholder text too!"
      rows="6"
    />
  </component-example>

  <component-example name="status" rows>
    <template #title>Hint and error state</template>

    <c-text-field
      label="Hint and error "
      hint="This is a hint messsage"
      :valid="!hasErrors"
      validation="This is an error message"
      required
    />

    <c-switch v-model="hasErrors" v-control>Toggle error status</c-switch>
  </component-example>
</template>

<script setup lang="ts">
// @example-start|slots|status
import { ref } from 'vue';
// @example-end
// @example-start|slots|status
import { mdiClose, mdiMagnify } from '@mdi/js';

const clearableValue = ref('');

const onClear = () => {
  clearableValue.value = '';
};
// @example-end

// @example-start|status
const hasErrors = ref(false);
// @example-end
</script>

<style lang="scss"></style>
