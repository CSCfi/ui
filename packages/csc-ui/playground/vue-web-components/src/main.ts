import { createApp, defineCustomElement } from 'vue';
import { applyPolyfills, defineCustomElements } from 'csc-ui/loader';
import App from './App.vue';
import WebCardComponent from './web-components/WebCard.ce.vue';

import './assets/main.css';

const WebCard = defineCustomElement(WebCardComponent);
customElements.define('c-web-card', WebCard);

applyPolyfills().then(() => {
  defineCustomElements(window);
});

createApp(App).mount('#app');
