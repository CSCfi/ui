# Vue directive for csc-ui components

## Installation
```
npm install @cscfi/csc-ui-vue
```

## Usage

```javascript
// main.ts

import { createApp } from 'vue';
import { applyPolyfills, defineCustomElements } from 'csc-ui/loader';
import { vControl } from '@cscfi/csc-ui-vue';

import App from './App.vue';

const app = createApp(App);

app.directive('control', vControl);

applyPolyfills().then(() => {
  defineCustomElements();
});

app.mount('#app');
```

```javascript
// vue component script

import { ref } from 'vue';

const test = ref('');
```

```html
<!-- vue component template -->

<c-text-field
  v-model="test"
  v-control
  label="Working 2 way binding"
/>
```
