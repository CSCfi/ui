import { createApp } from 'vue';
import { applyPolyfills, defineCustomElements } from '../../../dist/loader';

import App from './App.vue';
import { vControl } from './directives/vControl';

const app = createApp(App);

app.directive('control', vControl);

applyPolyfills().then(() => {
  defineCustomElements();
});

app.mount('#app');
