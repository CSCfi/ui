<template>
  <c-accordion v-model="expanded">
    <c-accordion-item heading="Project billing" value="billing">
      <p>Billing units are deducted monthly based on the resources in use.</p>
    </c-accordion-item>

    <c-accordion-item heading="Members and roles" value="members">
      <p>Invite members by email and assign them a role in the project.</p>
    </c-accordion-item>

    <c-accordion-item heading="Data storage" value="storage">
      <p>Allas object storage is available to every project by default.</p>
    </c-accordion-item>
  </c-accordion>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const expanded = ref<'billing' | 'members' | 'storage'>('billing');
</script>
