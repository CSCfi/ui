<template>
  <div>
    <c-accordion>
      <c-accordion-item heading="Project billing" value="billing">
        <c-icon slot="icon" :path="mdiCreditCardOutline" />
        <p>Billing units are deducted monthly based on the resources in use.</p>
      </c-accordion-item>
      <c-accordion-item heading="Members and roles" value="members">
        <c-icon slot="icon" :path="mdiAccountGroup" />
        <p>Invite members by email and assign them a role in the project.</p>
      </c-accordion-item>
      <c-accordion-item heading="Data storage" value="storage">
        <c-icon slot="icon" :path="mdiDatabase" />
        <p>Allas object storage is available to every project by default.</p>
      </c-accordion-item>
    </c-accordion>
  </div>
</template>

<script setup lang="ts">
import { mdiAccountGroup, mdiCreditCardOutline, mdiDatabase } from '@mdi/js';
</script>
