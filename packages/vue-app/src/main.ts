import './assets/main.css';
import '@cscfi/csc-ui-for-vue/css/theme.css';
import { ComponentLibrary} from '@cscfi/csc-ui-for-vue';

import { createApp } from 'vue';
import App from './App.vue';


const app = createApp(App);

app.use(ComponentLibrary);

app.mount('#app');
