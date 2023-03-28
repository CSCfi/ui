# Vue 2 directive for csc-ui components

## Installation
```
npm install @cscfi/csc-ui-vue2
```

## Usage

```javascript
// main.js

import Vue from 'vue';
import { applyPolyfills, defineCustomElements } from 'csc-ui/loader';
import { vControl } from '@cscfi/csc-ui-vue2';
import App from './App.vue';

Vue.config.productionTip = false;

Vue.config.ignoredElements = [/c-w*/];

Vue.directive('csc-model', vControl);

applyPolyfills().then(() => {
  defineCustomElements();
});

new Vue({
  render: (h) => h(App),
}).$mount('#app');
```

```html
<!-- Vue component template -->

<c-text-field label="Vorking 2 way binding" v-csc-model="test" />
```

```javascript
// Vue component script

data: () => ({
  test: '',
}),
```
