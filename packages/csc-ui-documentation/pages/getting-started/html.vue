<template>
  <c-card ref="cardRef" class="max-w-screen-xl mx-auto">
    <c-card-content>
      <h1 class="text-4xl capitalize font-bold text-primary-600">
        Usage In Basic HTML Page
      </h1>

      <p>
        You can choose either
        <code>npm</code>
        or
        <code>cdn</code>
        to bring the component library to your HTML page
      </p>

      <p><strong>CDN</strong></p>

      <p>Add following script before closing body tag</p>

      <code-block
        theme="atom-one-dark"
        lang="html"
        :code="cdn"
        code-block-radius="6px"
        highlightjs
        persistent-copy-button
      />

      <p>Add following line inside head tag to enable styles</p>

      <code-block
        theme="atom-one-dark"
        lang="html"
        :code="css"
        code-block-radius="6px"
        highlightjs
        persistent-copy-button
      />

      <p>
        Now you should be able to use the CSC Design system components in your
        HTML page.
      </p>
    </c-card-content>
  </c-card>
</template>

<script setup lang="ts">
import packageJson from '../../package.json';

const version = ref(packageJson.version);

const cdn = computed(() => {
  return (
    '<script src="https://cdn.jsdelivr.net/npm/@cscfi/csc-ui@' +
    version.value +
    '/dist/csc-ui/csc-ui.esm.js"></' +
    'script>'
  );
});

const css = computed(() => {
  return (
    '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@cscfi/csc-ui@' +
    version.value +
    '/dist/styles/css/theme.css"></link>'
  );
});
</script>
