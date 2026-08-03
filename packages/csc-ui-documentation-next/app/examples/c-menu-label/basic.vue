<template>
  <div class="example-row">
    <c-menu @select="onSelect">
      <c-button slot="trigger" outlined>
        Settings
        <c-icon :path="mdiChevronDown" />
      </c-button>

      <c-menu-label>Account</c-menu-label>

      <c-menu-item value="profile">Profile</c-menu-item>

      <c-menu-item value="notifications">Notifications</c-menu-item>

      <c-divider />

      <c-menu-label>Workspace</c-menu-label>

      <c-menu-item value="members">Members</c-menu-item>

      <c-menu-item value="billing">Billing</c-menu-item>
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
