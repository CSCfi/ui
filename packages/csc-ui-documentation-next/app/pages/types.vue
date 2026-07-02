<template>
  <article>
    <h1>Shared types</h1>

    <p class="lead">
      Types exported from <code>@cscfi/csc-ui-next</code> that appear in
      component prop and event signatures.
    </p>

    <section v-for="sharedType in sharedTypes" :key="sharedType.name" class="api-section">
      <h2 :id="sharedType.name">{{ sharedType.name }}</h2>

      <p v-if="sharedType.description" class="preline">{{ sharedType.description }}</p>

      <pre class="code-block"><code>{{ sharedType.declaration }}</code></pre>
    </section>
  </article>
</template>

<script setup lang="ts">
const { sharedTypes } = useManifest();

useHead({ title: 'Shared types — CSC Design System' });
</script>
