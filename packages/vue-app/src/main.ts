// import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import { CSCUiVue } from 'csc-ui-vue-library';
import { ComponentLibrary } from 'test-ui-vue';
import router from './router';

/* Theme variables */
// import './theme/variables.css';


const app = createApp(App);

app.use(router);
app.use(ComponentLibrary);
app.use(CSCUiVue);

router.isReady().then(() => {
  app.mount('#app');
});
