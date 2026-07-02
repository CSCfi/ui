<template>
  <div class="example-row">
    <c-menu @select="onSelect">
      <c-button slot="trigger" text>
        <c-icon :path="mdiAccount" />
        Account
        <c-icon :path="mdiChevronDown" />
      </c-button>

      <c-menu-item value="profile">View profile</c-menu-item>

      <c-menu-item value="billing" disabled>Billing (unavailable)</c-menu-item>

      <c-menu-item value="invite">Invite teammate</c-menu-item>

      <c-divider />

      <c-menu-item value="delete" danger>Delete account</c-menu-item>
    </c-menu>

    <span>Selected: {{ selected ?? '—' }}</span>
  </div>
</template>

<script setup lang="ts">
import { mdiAccount, mdiChevronDown } from '@mdi/js';

const selected = ref<null | string>(null);

const onSelect = (event: Event) => {
  selected.value = (event as CustomEvent<{ value: string }>).detail.value;
};
</script>
