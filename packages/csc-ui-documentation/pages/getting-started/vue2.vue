<template>
  <c-card ref="cardRef" class="max-w-screen-xl mx-auto">
    <c-card-content>
      <h1 class="text-4xl capitalize font-bold text-primary-600">
        Usage in Vue 2.x
      </h1>

      <p><strong>1. Install the required dependencies</strong></p>

      <code-block
        theme="atom-one-dark"
        lang="html"
        code="npm install @cscfi/csc-ui @cscfi/csc-ui-vue2"
        code-block-radius="6px"
        highlightjs
        persistent-copy-button
      />

      <p>
        This command will install the CSC Design system component library
        <code>@cscfi/csc-ui</code>
        and the directive
        <code>@cscfi/csc-ui-vue2</code>
        which allows the components to support 2-way model binding.
      </p>

      <p>
        <strong>
          2. Configure the project to utilize the components by adding these
          lines to
          <code>main.js</code>
        </strong>
      </p>

      <code-block
        theme="atom-one-dark"
        lang="typescript"
        :code="vueJs"
        code-block-radius="6px"
        highlightjs
        persistent-copy-button
      />
    </c-card-content>
  </c-card>
</template>

<script setup lang="ts">
const vueJs = `import Vue from 'vue';
import { applyPolyfills, defineCustomElements } from '@cscfi/csc-ui/loader';
import { vControl } from '@cscfi/csc-ui-vue2';
import App from './App.vue';

Vue.config.productionTip = false;

Vue.config.ignoredElements = [/c-\\w*/];

Vue.directive('csc-model', vControl);

applyPolyfills().then(() => {
  defineCustomElements();
});

new Vue({
  render: (h) => h(App),
}).$mount('#app');
`;
</script>
