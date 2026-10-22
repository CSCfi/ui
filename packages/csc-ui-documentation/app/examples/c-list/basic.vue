<template>
  <div>
    <c-list bordered>
      <c-list-item
        v-for="item in items"
        :key="item.label"
        :active="selected === item.label"
        ripple
        @click="selected = item.label"
      >
        <c-icon slot="pre" :path="item.icon" />

        <c-list-item-title>{{ item.label }}</c-list-item-title>
      </c-list-item>
    </c-list>
  </div>
</template>

<script setup lang="ts">
import { mdiAccount, mdiBell, mdiCog } from '@mdi/js';
import { ref } from 'vue';

const items = [
  { icon: mdiAccount, label: 'Profile' },
  { icon: mdiBell, label: 'Notifications' },
  { icon: mdiCog, label: 'Settings' },
];

const selected = ref('Profile');
</script>
