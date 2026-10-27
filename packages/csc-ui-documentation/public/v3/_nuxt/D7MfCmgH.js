import{m as l,c,o as i,a as e,b as s,y as r,d as t}from"./Ch6KfFdQ.js";const p={ref:"cardRef",class:"max-w-screen-xl mx-auto"},u=`import Vue from 'vue';
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
`,f=l({__name:"vue2",setup(d){return(a,o)=>{const n=r("code-block");return i(),c("c-card",p,[e("c-card-content",null,[o[0]||(o[0]=e("h1",{class:"text-4xl capitalize font-bold text-primary-600"}," Usage in Vue 2.x ",-1)),o[1]||(o[1]=e("p",null,[e("strong",null,"1. Install the required dependencies")],-1)),s(n,{theme:"atom-one-dark",lang:"html",code:"npm install @cscfi/csc-ui @cscfi/csc-ui-vue2","code-block-radius":"6px",highlightjs:"","persistent-copy-button":""}),o[2]||(o[2]=e("p",null,[t(" This command will install the CSC Design system component library "),e("code",null,"@cscfi/csc-ui"),t(" and the directive "),e("code",null,"@cscfi/csc-ui-vue2"),t(" which allows the components to support 2-way model binding. ")],-1)),o[3]||(o[3]=e("p",null,[e("strong",null,[t(" 2. Configure the project to utilize the components by adding these lines to "),e("code",null,"main.js")])],-1)),s(n,{theme:"atom-one-dark",lang:"typescript",code:u,"code-block-radius":"6px",highlightjs:"","persistent-copy-button":""}),o[4]||(o[4]=e("p",null,[e("strong",null,[t(" 3. Add the following line to "),e("code",null,"main.css")])],-1)),s(n,{theme:"atom-one-dark",lang:"css",code:"@import url('@cscfi/csc-ui/css/theme.css');","code-block-radius":"6px",highlightjs:"","persistent-copy-button":""})])],512)}}});export{f as default};
