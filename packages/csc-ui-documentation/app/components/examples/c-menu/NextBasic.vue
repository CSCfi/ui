<template>
  <component-example name="nextbasic" rows>
    <template #title>Basic usage</template>

    <template #subtitle>
      A command menu with a trigger, a grouping label, a divider, and a select
      event
    </template>

    <c-menu @select="onSelect">
      <c-button slot="trigger" text>
        Device
        <c-icon :path="mdiChevronDown" />
      </c-button>

      <c-menu-label>Type</c-menu-label>

      <c-menu-item value="phone">Phone</c-menu-item>

      <c-menu-item value="tablet">Tablet</c-menu-item>

      <c-menu-item value="desktop">Desktop</c-menu-item>

      <c-divider />

      <c-menu-item value="more">More options…</c-menu-item>

      <c-menu-item value="forget" danger>Forget this device</c-menu-item>
    </c-menu>

    <p class="mt-3">Selected value: {{ selected ?? '—' }}</p>
  </component-example>
</template>

<script setup lang="ts">
import { mdiChevronDown } from '@mdi/js';
import { ref } from 'vue';

const selected = ref<null | string>(null);

const onSelect = (event: CustomEvent<{ value: string }>) => {
  selected.value = event.detail.value;
};
</script>
