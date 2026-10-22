<template>
  <div>
    <c-tree-select
      v-model="field"
      :items
      hint="Some units have sub-units, some do not"
      label="Unit"
      clearable
    />

    <p>Value: {{ field ?? 'null' }}</p>
  </div>
</template>

<script setup lang="ts">
import type { CTreeSelectItem } from '@cscfi/csc-ui';

import { ref } from 'vue';

const items: CTreeSelectItem[] = [
  {
    children: [
      {
        children: [
          { name: 'High-performance computing', value: 'hpc' },
          { name: 'Cloud services', value: 'cloud' },
          { disabled: true, name: 'Quantum computing', value: 'quantum' },
        ],
        name: 'Computing',
        value: 'computing',
      },
      { name: 'Data management', value: 'data' },
    ],
    name: 'Research services',
    value: 'research',
  },
  {
    children: [
      { name: 'Training', value: 'training' },
      { name: 'Learning materials', value: 'materials' },
    ],
    name: 'Education',
    value: 'education',
  },
  {
    children: [{ name: 'Human resources', value: 'hr' }],
    disabled: true,
    name: 'Administration',
    value: 'administration',
  },
  { name: 'Communications', value: 'communications' },
];

const field = ref<null | string>(null);
</script>
