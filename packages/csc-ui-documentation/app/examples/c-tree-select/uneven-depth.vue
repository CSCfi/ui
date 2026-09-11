<template>
  <div>
    <c-tree-select
      v-model="field"
      :items.prop="items"
      hint="Some units have sub-units, some do not"
      label="Unit"
      clearable
    />

    <p>Value: {{ field ?? 'null' }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

import type { CTreeSelectItem } from '@cscfi/csc-ui';

const items: CTreeSelectItem[] = [
  {
    value: 'research',
    name: 'Research services',
    children: [
      {
        value: 'computing',
        name: 'Computing',
        children: [
          { value: 'hpc', name: 'High-performance computing' },
          { value: 'cloud', name: 'Cloud services' },
          { value: 'quantum', name: 'Quantum computing', disabled: true },
        ],
      },
      { value: 'data', name: 'Data management' },
    ],
  },
  {
    value: 'education',
    name: 'Education',
    children: [
      { value: 'training', name: 'Training' },
      { value: 'materials', name: 'Learning materials' },
    ],
  },
  {
    value: 'administration',
    name: 'Administration',
    disabled: true,
    children: [{ value: 'hr', name: 'Human resources' }],
  },
  { value: 'communications', name: 'Communications' },
];

const field = ref<string | null>(null);
</script>
