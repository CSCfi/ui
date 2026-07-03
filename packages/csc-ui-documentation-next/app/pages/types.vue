<template>
  <article>
    <h1>Shared types</h1>

    <p class="lead">
      Types exported from <code>@cscfi/csc-ui-next</code> that appear in
      component prop and event signatures.
    </p>

    <section
      v-for="sharedType in sharedTypes"
      :key="sharedType.name"
      class="doc-section"
    >
      <h2 :id="sharedType.name">{{ sharedType.name }}</h2>

      <p v-if="sharedType.description" class="preline">
        {{ sharedType.description }}
      </p>

      <!-- eslint-disable-next-line vue/no-v-html — Shiki output built at prerender from manifest type text -->
      <div
        v-if="declarationsHtml[sharedType.name]"
        class="example-shiki"
        v-html="declarationsHtml[sharedType.name]"
      />
      <pre v-else class="code-block"><code>{{ sharedType.declaration }}</code></pre>
    </section>
  </article>
</template>

<script setup lang="ts">
const { sharedTypes } = useManifest();

const { data } = await useAsyncData('shared-types', async () => {
  const { highlightCode } = await import('~/utils/highlight');

  const out: Record<string, string> = {};

  for (const sharedType of sharedTypes) {
    out[sharedType.name] = await highlightCode(sharedType.declaration, 'ts');
  }

  return out;
});

const declarationsHtml = computed(() => data.value ?? {});

useHead({ title: 'Shared types — CSC Design System' });
</script>
