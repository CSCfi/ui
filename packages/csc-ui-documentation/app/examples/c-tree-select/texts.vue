<template>
  <div>
    <c-tree-select
      v-model="field"
      :items="items"
      :level-labels="levelLabels"
      :texts="texts"
      hint="Selaa tasoja tai hae"
      label="Tieteenala"
      clearable
    />

    <p>Value: {{ field ?? 'null' }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

import type { CTreeSelectItem, CTreeSelectTexts } from '@cscfi/csc-ui';

const items: CTreeSelectItem[] = [
  {
    value: '1',
    code: '1',
    name: 'Luonnontieteet',
    children: [
      {
        value: '111',
        code: '111',
        name: 'Matematiikka',
        children: [
          { value: '1111', code: '1111', name: 'Puhdas matematiikka' },
          { value: '1112', code: '1112', name: 'Sovellettu matematiikka' },
        ],
      },
      {
        value: '113',
        code: '113',
        name: 'Tietojenkäsittely ja informaatiotieteet',
        children: [
          { value: '1131', code: '1131', name: 'Tietojenkäsittelytiede' },
          { value: '1132', code: '1132', name: 'Tietojärjestelmätiede' },
        ],
      },
    ],
  },
  {
    value: '2',
    code: '2',
    name: 'Tekniikka',
    children: [
      {
        value: '213',
        code: '213',
        name: 'Sähkö-, automaatio- ja tietoliikennetekniikka',
        children: [
          { value: '2131', code: '2131', name: 'Elektroniikka' },
          { value: '2133', code: '2133', name: 'Tietoliikennetekniikka' },
        ],
      },
      {
        value: '217',
        code: '217',
        name: 'Lääketieteen tekniikka',
        children: [
          { value: '2171', code: '2171', name: 'Biolääketieteen tekniikka' },
          {
            value: '2172',
            code: '2172',
            name: 'Lääketieteellinen kuvantaminen',
          },
        ],
      },
    ],
  },
];

const levelLabels = ['päätieteenala', 'tieteenala', 'alatieteenala'];

const texts: CTreeSelectTexts = {
  breadcrumb: 'Sijainti',
  browse: 'Selaa sen sijaan',
  children: (count) => `${count} alakohtaa`,
  choose: (level) => `Valitse ${level}`,
  clearSelection: 'Tyhjennä valinta',
  filterOptions: 'Suodata vaihtoehtoja',
  final: 'Viimeinen taso',
  level: (n) => `taso ${n}`,
  matches: (count) => `${count} osumaa`,
  noResults: 'Ei osumia',
  root: 'Kaikki',
  searchPlaceholder: 'Hae nimellä tai koodilla',
  select: (name) => `Valitse ${name}`,
  step: (n, total) => `Vaihe ${n}/${total}`,
  toggleOptions: 'Näytä vaihtoehdot',
};

const field = ref<string | null>(null);
</script>
