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
        <strong>
          4. Add the following line to
          <code>main.css</code>
        </strong>
      </p>

      <code-block
        theme="atom-one-dark"
        lang="css"
        code="@import url('@cscfi/csc-ui/css/theme.css');"
        code-block-radius="6px"
        highlightjs
        persistent-copy-button
      />

      <p>
        Now you should be able to use the CSC Design system components in your
        project.
      </p>

      <p class="mt-6">
        <strong>5. (Optional) Enable dark mode</strong>
      </p>

      <p>
        When using
        <code>@cscfi/csc-ui-next</code>,
        also import the semantic-token stylesheet, which carries the dark-mode
        values:
      </p>

      <code-block
        theme="atom-one-dark"
        lang="css"
        code="@import url('@cscfi/csc-ui-next/css/tokens.css');"
        code-block-radius="6px"
        highlightjs
        persistent-copy-button
      />

      <p>
        Then set the
        <code>data-theme</code>
        attribute on
        <code>&lt;html&gt;</code>
        to
        <code>dark</code>
        or
        <code>light</code>
        — or omit it to follow the operating system. See the
        <nuxt-link to="/design-tokens/dark-mode">
          <c-link underline>Dark mode</c-link>
        </nuxt-link>
        page for the full contract and a live token preview.
      </p>
    </c-card-content>
  </c-card>
</template>

<script setup lang="ts">
const mainTs = `import { createApp } from 'vue';
import { applyPolyfills, defineCustomElements } from '@cscfi/csc-ui/loader';
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
