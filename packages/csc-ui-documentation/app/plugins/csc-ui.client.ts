import { defineCustomElements } from '@cscfi/csc-ui';

// Custom elements upgrade on the client only; the prerendered markup keeps
// the c-* tags inert until this runs.
export default defineNuxtPlugin(() => {
  defineCustomElements();
});
