<template>
  <div>
    <!-- In multiple mode the value is an array in pick order. The panel stays
         open after a pick and keeps its query, so several matches can be
         picked in a row; `max-tags` folds the tags past that count into one
         "+N more" tag. -->
    <c-autocomplete
      v-model="languages"
      hint="Type to filter, pick several"
      label="Programming languages"
      max-tags="3"
      placeholder="Start typing to search"
      clearable
      multiple
    >
      <!-- An option can carry more than its label: wrap the label in
           c-option-value and lay the rest out through a `part` — the row
           shows a copy of this markup inside the panel, where page classes
           do not reach. The icon takes its brand colour through `color`. -->
      <c-option
        v-for="option in options"
        :key="option.value"
        :value="option.value"
      >
        <div part="language">
          <c-option-value>{{ option.label }}</c-option-value>

          <c-icon :color="option.color" :path="option.icon" />
        </div>
      </c-option>
    </c-autocomplete>

    <p>Value: {{ languages.length ? languages.join(', ') : '[]' }}</p>
  </div>
</template>

<script setup lang="ts">
import {
  mdiLanguageGo,
  mdiLanguageJavascript,
  mdiLanguagePython,
  mdiLanguageRuby,
  mdiLanguageRust,
  mdiLanguageTypescript,
} from '@mdi/js';
import { ref } from 'vue';

const languages = ref<string[]>(['ts']);

const options = [
  {
    color: '#F7DF1E',
    icon: mdiLanguageJavascript,
    label: 'JavaScript',
    value: 'js',
  },
  {
    color: '#3178C6',
    icon: mdiLanguageTypescript,
    label: 'TypeScript',
    value: 'ts',
  },
  {
    color: '#3776AB',
    icon: mdiLanguagePython,
    label: 'Python',
    value: 'py',
  },
  {
    color: '#CE422B',
    icon: mdiLanguageRust,
    label: 'Rust',
    value: 'rs',
  },
  {
    color: '#00ADD8',
    icon: mdiLanguageGo,
    label: 'Go',
    value: 'go',
  },
  {
    color: '#CC342D',
    icon: mdiLanguageRuby,
    label: 'Ruby',
    value: 'rb',
  },
];
</script>

<style>
/* Option content is copied into the panel: page classes do not reach it,
   the `part` does. */
c-autocomplete::part(language) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}
</style>
