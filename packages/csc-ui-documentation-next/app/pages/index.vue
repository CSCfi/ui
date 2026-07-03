<template>
  <article>
    <h1>Components</h1>

    <p class="lead">
      {{ navComponents.length }} components, documented straight from the
      library's Custom Elements Manifest — the tables on every page are
      generated from the same source the build verifies.
    </p>

    <ul class="component-grid">
      <li v-for="component in navComponents" :key="component.tagName">
        <NuxtLink class="component-card" :to="`/components/${component.tagName}`">
          <code>&lt;{{ component.tagName }}&gt;</code>
          <p v-if="component.description">{{ firstSentence(component.description) }}</p>
        </NuxtLink>
      </li>
    </ul>
  </article>
</template>

<script setup lang="ts">
const { navComponents } = useManifest();

const firstSentence = (text: string) => text.split(/(?<=\.)\s/)[0];

useHead({ title: 'Components — CSC Design System' });
</script>
