import{m as l,c as i,o as p,a as e,b as s,y as c,d as o}from"./Ch6KfFdQ.js";const r={ref:"cardRef",class:"max-w-screen-xl mx-auto"},u=`import { createApp } from 'vue';
import { applyPolyfills, defineCustomElements } from '@cscfi/csc-ui/loader';
import { vControl } from '@cscfi/csc-ui-vue';

import App from './App.vue';

const app = createApp(App);

app.directive('control', vControl);

applyPolyfills().then(() => {
  defineCustomElements();
});

app.mount('#app');`,a=`import { defineConfig } from 'vite';
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

});`,g=l({__name:"vue3",setup(m){return(d,t)=>{const n=c("code-block");return p(),i("c-card",r,[e("c-card-content",null,[t[0]||(t[0]=e("h1",{class:"text-4xl capitalize font-bold text-primary-600"}," Usage in Vue 3.x ",-1)),t[1]||(t[1]=e("p",null,[e("strong",null,"1. Install the required dependencies")],-1)),s(n,{theme:"atom-one-dark",lang:"html",code:"npm install @cscfi/csc-ui @cscfi/csc-ui-vue","code-block-radius":"6px",highlightjs:"","persistent-copy-button":""}),t[2]||(t[2]=e("p",null,[o(" This command will install the CSC Design system component library "),e("code",null,"@cscfi/csc-ui"),o(" and the directive "),e("code",null,"@cscfi/csc-ui-vue"),o(" which allows the components to support 2-way model binding. ")],-1)),t[3]||(t[3]=e("p",null,[e("strong",null,[o(" 2. Configure the project to utilize the components by adding these lines to "),e("code",null,"main.ts")])],-1)),s(n,{theme:"atom-one-dark",lang:"typescript",code:u,"code-block-radius":"6px",highlightjs:"","persistent-copy-button":""}),t[4]||(t[4]=e("p",null,[e("strong",null,[o(" 3. Add the following lines to "),e("code",null,"vite.config.ts")])],-1)),s(n,{theme:"atom-one-dark",lang:"typescript",code:a,"code-block-radius":"6px",highlightjs:"","persistent-copy-button":""}),t[5]||(t[5]=e("p",null,[e("strong",null,[o(" 4. Add the following line to "),e("code",null,"main.css")])],-1)),s(n,{theme:"atom-one-dark",lang:"css",code:"@import url('@cscfi/csc-ui/css/theme.css');","code-block-radius":"6px",highlightjs:"","persistent-copy-button":""}),t[6]||(t[6]=e("p",null," Now you should be able to use the CSC Design system components in your project. ",-1))])],512)}}});export{g as default};
