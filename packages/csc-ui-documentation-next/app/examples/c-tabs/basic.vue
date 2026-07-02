<template>
  <div>
    <c-tabs :value.prop="tab" @changeValue="onChange">
      <c-tab value="summary">Summary</c-tab>
      <c-tab value="members">Members</c-tab>
      <c-tab value="settings">Settings</c-tab>

      <c-tab-items slot="items">
        <c-tab-item value="summary">
          <p>Overview of the project and its recent activity.</p>
        </c-tab-item>
        <c-tab-item value="members">
          <p>People with access to this project.</p>
        </c-tab-item>
        <c-tab-item value="settings">
          <p>Project name, description and visibility.</p>
        </c-tab-item>
      </c-tab-items>
    </c-tabs>
  </div>
</template>

<script setup lang="ts">
const tab = ref<number | string>('summary');

const onChange = (event: Event) => {
  tab.value = (event as CustomEvent<number | string>).detail;
};
</script>
