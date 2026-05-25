<template>
  <c-card ref="cardRef" class="max-w-screen-xl mx-auto">
    <c-card-content>
      <h1 class="text-4xl capitalize font-bold text-primary-600">
        Usage in React
      </h1>

      <p><strong>1. Install the required dependencies</strong></p>

      <code-block
        theme="atom-one-dark"
        lang="html"
        code="npm install @cscfi/csc-ui @cscfi/csc-ui-react"
        code-block-radius="6px"
        highlightjs
        persistent-copy-button
      />

      <p>
        This command will install the CSC Design system component library
        <code>@cscfi/csc-ui</code>
        and the wrapper
        <code>@cscfi/csc-ui-react</code>
        which allows the components to support 2-way model binding.
      </p>

      <p>
        <strong>
          2. Add the following line to eg.
          <code>App.css</code>
        </strong>
      </p>

      <code-block
        theme="atom-one-dark"
        lang="css"
        code="@import url('@cscfi/csc-ui-react/css/theme.css');"
        code-block-radius="6px"
        highlightjs
        persistent-copy-button
      />

      <p>
        <strong>Working example with 2-way binding</strong>
      </p>

      <div id="react-example" />
    </c-card-content>
  </c-card>
</template>

<script setup lang="ts">
import sdk from '@stackblitz/sdk';

onMounted(() => {
  sdk.embedProjectId('react-example', 'vitejs-vite-d6igeu', {
    forceEmbedLayout: true,
    openFile: 'src/App.tsx',
    height: '1000px',
    view: 'preview',
  });
});
</script>
