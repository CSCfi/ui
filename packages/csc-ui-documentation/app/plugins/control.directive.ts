import { vControl } from '@cscfi/csc-ui-vue';

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('control', vControl);
});
