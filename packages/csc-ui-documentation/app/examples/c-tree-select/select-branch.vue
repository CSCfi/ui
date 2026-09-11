<template>
  <div>
    <c-tree-select
      v-model="field"
      :items="items"
      :level-labels="levelLabels"
      hint="A main field or a field can be picked as well"
      label="Field of science"
      allow-branch
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
    value: '1',
    code: '1',
    name: 'Natural sciences',
    children: [
      {
        value: '111',
        code: '111',
        name: 'Mathematics',
        children: [
          { value: '1111', code: '1111', name: 'Pure mathematics' },
          { value: '1112', code: '1112', name: 'Applied mathematics' },
          { value: '1113', code: '1113', name: 'Statistics and probability' },
        ],
      },
      {
        value: '113',
        code: '113',
        name: 'Computer and information sciences',
        children: [
          { value: '1131', code: '1131', name: 'Computer science' },
          { value: '1132', code: '1132', name: 'Information systems' },
          { value: '1133', code: '1133', name: 'Software engineering' },
        ],
      },
      {
        value: '114',
        code: '114',
        name: 'Physical sciences',
        children: [
          { value: '1141', code: '1141', name: 'Particle physics' },
          { value: '1142', code: '1142', name: 'Condensed matter physics' },
          { value: '1143', code: '1143', name: 'Astronomy and space science' },
        ],
      },
    ],
  },
  {
    value: '2',
    code: '2',
    name: 'Engineering and technology',
    children: [
      {
        value: '213',
        code: '213',
        name: 'Electronic, automation and communications engineering',
        children: [
          { value: '2131', code: '2131', name: 'Electronics' },
          {
            value: '2132',
            code: '2132',
            name: 'Automation and systems engineering',
          },
          { value: '2133', code: '2133', name: 'Telecommunications' },
        ],
      },
      {
        value: '217',
        code: '217',
        name: 'Medical engineering',
        children: [
          { value: '2171', code: '2171', name: 'Biomedical engineering' },
          { value: '2172', code: '2172', name: 'Medical imaging' },
        ],
      },
    ],
  },
  {
    value: '3',
    code: '3',
    name: 'Medical and health sciences',
    children: [
      {
        value: '311',
        code: '311',
        name: 'Biomedicine',
        children: [
          { value: '3111', code: '3111', name: 'Cell and molecular biology' },
          { value: '3112', code: '3112', name: 'Neurosciences' },
        ],
      },
      {
        value: '312',
        code: '312',
        name: 'Clinical medicine',
        children: [
          { value: '3121', code: '3121', name: 'Internal medicine' },
          { value: '3122', code: '3122', name: 'Cancers' },
          { value: '3123', code: '3123', name: 'Gynaecology and paediatrics' },
        ],
      },
    ],
  },
];

const levelLabels = ['main field', 'field', 'subfield'];

const field = ref<string | null>(null);
</script>
