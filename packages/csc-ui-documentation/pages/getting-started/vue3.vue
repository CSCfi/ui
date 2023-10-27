<template>
  <c-card ref="cardRef" class="max-w-screen-xl mx-auto">
    <c-card-content>
      <h1 class="text-4xl capitalize font-bold text-primary-600">
        Usage in Vue 3.x
      </h1>

      <p><strong>1. Install the required dependencies</strong></p>

      <code-block
        theme="atom-one-dark"
        lang="html"
        code="npm install @cscfi/csc-ui @cscfi/csc-ui-vue"
        code-block-radius="6px"
        highlightjs
        persistent-copy-button
      />

      <p>
        This command will install the CSC Design system component library
        <code>@cscfi/csc-ui</code>
        and the directive
        <code>@cscfi/csc-ui-vue</code>
        which allows the components to support 2-way model binding.
      </p>

      <p>
        <strong>
          2. Configure the project to utilize the components by adding these
          lines to
          <code>main.ts</code>
        </strong>
      </p>

      <code-block
        theme="atom-one-dark"
        lang="typescript"
        :code="mainTs"
        code-block-radius="6px"
        highlightjs
        persistent-copy-button
      />

      <p>
        <strong>
          3. Add the following lines to
          <code>vite.config.ts</code>
        </strong>
      </p>

      <code-block
        theme="atom-one-dark"
        lang="typescript"
        :code="viteConfig"
        code-block-radius="6px"
        highlightjs
        persistent-copy-button
      />

      <p>
        Now you should be able to use the CSC Design system components in your
        project.
      </p>
    </c-card-content>
  </c-card>
</template>

<script setup lang="ts">
const mainTs = `import { createApp } from 'vue';
import { applyPolyfills, defineCustomElements } from 'csc-ui/loader';
import { vControl } from '@cscfi/csc-ui-vue';

import App from './App.vue';

const app = createApp(App);

app.directive('control', vControl);

applyPolyfills().then(() => {
  defineCustomElements();
});

app.mount('#app');`;

const viteConfig = `import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag.startsWith('c-'),
        },
      },
    }),
  ],

  ...

});`;
</script>
