<template>
  <component-example name="nextdisabled" rows>
    <template #title>Disabled items</template>

    <template #subtitle>
      Add the <code>disabled</code> attribute to an item — it renders dimmed,
      emits no select event, and is skipped by keyboard navigation
    </template>

    <c-menu @select="onSelect">      
      <c-button slot="trigger" text>
        <c-icon :path="mdiAccount" />
        Account
        <c-icon :path="mdiChevronDown" />
      </c-button>

      <c-menu-label>Actions</c-menu-label>

      <c-menu-item value="profile">View profile</c-menu-item>

      <c-menu-item value="billing" disabled>Billing (unavailable)</c-menu-item>

      <c-menu-item value="invite">Invite teammate</c-menu-item>

      <c-divider />

      <c-menu-item value="delete" danger disabled>Delete account</c-menu-item>
    </c-menu>

    <p class="mt-3">Selected value: {{ selected ?? '—' }}</p>
  </component-example>
</template>

<script setup lang="ts">
import { mdiAccount, mdiChevronDown } from '@mdi/js';
import { ref } from 'vue';

const selected = ref<null | string>(null);

const onSelect = (event: CustomEvent<{ value: string }>) => {
  selected.value = event.detail.value;
};
</script>
