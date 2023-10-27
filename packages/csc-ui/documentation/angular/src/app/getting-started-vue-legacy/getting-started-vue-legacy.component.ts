import { Component, OnInit } from '@angular/core';
import sdk from '@stackblitz/sdk';

@Component({
  selector: 'app-getting-started-vue-legacy',
  templateUrl: './getting-started-vue-legacy.component.html',
  styleUrls: ['./getting-started-vue-legacy.component.scss'],
})
export class GettingStartedVueLegacyComponent implements OnInit {
  constructor() {}
  initialize = `sudo npm install -g @vue/cli
vue create my-project`;

  installation = `cd my-project
npm install csc-ui @cscfi/csc-ui-vue2`;

  mainJs = `import Vue from 'vue';
import { applyPolyfills, defineCustomElements } from 'csc-ui/loader';
import { vControl } from '@cscfi/csc-ui-vue2';
import App from './App.vue';

Vue.config.productionTip = false;

Vue.config.ignoredElements = [/c-\w*/];

Vue.directive('csc-model', vControl);

applyPolyfills().then(() => {
  defineCustomElements();
});

new Vue({
  render: (h) => h(App),
}).$mount('#app');
`;
  ngOnInit(): void {
    sdk.embedProjectId('simple-example', 'csc-ui-vue2-example', {
      forceEmbedLayout: true,
      openFile: 'src/App.vue',
      view: 'preview',
      clickToLoad: true,
      hideNavigation: true,
      height: 600,
    });
  }
}
