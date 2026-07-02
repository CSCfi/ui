<template>
  <div>
    <c-accordion :value.prop="expanded" @changeValue="onChange">
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
  </div>
</template>

<script setup lang="ts">
const expanded = ref<number | string | null>('billing');

const onChange = (event: Event) => {
  expanded.value = (event as CustomEvent<number | string | null>).detail;
};
</script>
