<template>
  <component-example name="disabled" rows>
    <template #title>Disabled</template>

    <c-switch v-model="disabled" v-control>
      {{ disabled ? 'Disabled' : 'Not disabled' }}
    </c-switch>

    <c-list :disabled="disabled">
      <c-list-item>
        <c-icon slot="pre" color="var(--c-primary-600)" :path="mdiHome" />

        <c-list-item-title>Address</c-list-item-title>

        Example street 12
        <c-icon-button slot="post" :disabled="disabled" size="small" text>
          <c-icon :path="mdiPencil" />
        </c-icon-button>
      </c-list-item>

      <c-list-item>
        <c-icon slot="pre" color="var(--c-primary-600)" :path="mdiPhone" />

        <c-list-item-title>Phone</c-list-item-title>

        +358 40 1234 123
        <c-icon-button slot="post" :disabled="disabled" size="small" text>
          <c-icon :path="mdiPencil" />
        </c-icon-button>
      </c-list-item>

      <c-list-item>
        <c-icon slot="pre" color="var(--c-primary-600)" :path="mdiEmail" />

        <c-list-item-title>Email</c-list-item-title>

        example.person@example.com
        <c-icon-button slot="post" :disabled="disabled" size="small" text>
          <c-icon :path="mdiPencil" />
        </c-icon-button>
      </c-list-item>
    </c-list>
  </component-example>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { mdiEmail, mdiHome, mdiPencil, mdiPhone } from '@mdi/js';

const disabled = ref(true);
</script>
