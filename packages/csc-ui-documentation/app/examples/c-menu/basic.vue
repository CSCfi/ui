<template>
  <div class="example-row">
    <c-menu @select="onSelect">
      <c-button slot="trigger" outlined>
        Device
        <c-icon :path="mdiChevronDown" />
      </c-button>

      <c-menu-label>Type</c-menu-label>

      <c-menu-item value="phone">Phone</c-menu-item>

      <c-menu-item value="tablet">Tablet</c-menu-item>

      <c-menu-item value="desktop">Desktop</c-menu-item>

      <c-divider />

      <c-menu-item value="forget" danger>Forget this device</c-menu-item>
    </c-menu>

    <p>Selected: {{ selected ?? '—' }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

import { mdiChevronDown } from '@mdi/js';

const selected = ref<null | string>(null);

const onSelect = (event: Event) => {
  selected.value = (event as CustomEvent<{ value: string }>).detail.value;
};
</script>
