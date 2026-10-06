<template>
  <div>
    <c-tree-select
      v-model="field"
      :filter
      :items
      :level-labels
      hint="Matches an item's own code prefix or name"
      label="Field of science"
      placeholder="Type a code prefix or a name"
      clearable
    />

    <p>Value: {{ field ?? 'null' }}</p>
  </div>
</template>

<script setup lang="ts">
import type { CTreeSelectFilter, CTreeSelectItem } from '@cscfi/csc-ui';

import { ref } from 'vue';

const items: CTreeSelectItem[] = [
  {
    children: [
      {
        children: [
          { code: '1111', name: 'Pure mathematics', value: '1111' },
          { code: '1112', name: 'Applied mathematics', value: '1112' },
          { code: '1113', name: 'Statistics and probability', value: '1113' },
        ],
        code: '111',
        name: 'Mathematics',
        value: '111',
      },
      {
        children: [
          { code: '1131', name: 'Computer science', value: '1131' },
          { code: '1132', name: 'Information systems', value: '1132' },
          { code: '1133', name: 'Software engineering', value: '1133' },
        ],
        code: '113',
        name: 'Computer and information sciences',
        value: '113',
      },
      {
        children: [
          { code: '1141', name: 'Particle physics', value: '1141' },
          { code: '1142', name: 'Condensed matter physics', value: '1142' },
          { code: '1143', name: 'Astronomy and space science', value: '1143' },
        ],
        code: '114',
        name: 'Physical sciences',
        value: '114',
      },
    ],
    code: '1',
    name: 'Natural sciences',
    value: '1',
  },
  {
    children: [
      {
        children: [
          { code: '2131', name: 'Electronics', value: '2131' },
          {
            code: '2132',
            name: 'Automation and systems engineering',
            value: '2132',
          },
          { code: '2133', name: 'Telecommunications', value: '2133' },
        ],
        code: '213',
        name: 'Electronic, automation and communications engineering',
        value: '213',
      },
      {
        children: [
          { code: '2171', name: 'Biomedical engineering', value: '2171' },
          { code: '2172', name: 'Medical imaging', value: '2172' },
        ],
        code: '217',
        name: 'Medical engineering',
        value: '217',
      },
    ],
    code: '2',
    name: 'Engineering and technology',
    value: '2',
  },
  {
    children: [
      {
        children: [
          { code: '3111', name: 'Cell and molecular biology', value: '3111' },
          { code: '3112', name: 'Neurosciences', value: '3112' },
        ],
        code: '311',
        name: 'Biomedicine',
        value: '311',
      },
      {
        children: [
          { code: '3121', name: 'Internal medicine', value: '3121' },
          { code: '3122', name: 'Cancers', value: '3122' },
          { code: '3123', name: 'Gynaecology and paediatrics', value: '3123' },
        ],
        code: '312',
        name: 'Clinical medicine',
        value: '312',
      },
    ],
    code: '3',
    name: 'Medical and health sciences',
    value: '3',
  },
];

const levelLabels = ['main field', 'field', 'subfield'];

// The default search matches the query anywhere in the name or code of an
// item and of its ancestors. This one matches the item's own code by prefix
// and its own name anywhere — so "11" lists Mathematics and its subfields,
// but "Natural" lists only the main field itself.
const filter: CTreeSelectFilter = (item, query) => {
  const q = query.trim().toLowerCase();

  return !!item.code?.startsWith(q) || item.name.toLowerCase().includes(q);
};

const field = ref<null | string>(null);
</script>
