<template>
  <div>
    <c-list>
      <c-list-item hoverable>
        <c-icon slot="pre" :path="mdiAccount" />

        <c-list-item-title>Profile</c-list-item-title>
      </c-list-item>

      <c-list-item active>
        <c-icon slot="pre" :path="mdiBell" />

        <c-list-item-title>Notifications</c-list-item-title>

        <c-icon slot="post" :path="mdiChevronRight" />
      </c-list-item>

      <c-list-item disabled>
        <c-icon slot="pre" :path="mdiCog" />

        <c-list-item-title>Settings</c-list-item-title>
      </c-list-item>
    </c-list>
  </div>
</template>

<script setup lang="ts">
import { mdiAccount, mdiBell, mdiChevronRight, mdiCog } from '@mdi/js';
</script>
