import { Config } from '@stencil/core';
import {
  ComponentModelConfig,
  vueOutputTarget,
} from '@stencil/vue-output-target';

const componentModels: ComponentModelConfig[] = [
  {
    elements: ['my-component'],
    event: 'change-value',
    targetAttr: 'value',
  },
];

export const config: Config = {
  namespace: 'test-ui',
  outputTargets: [
    vueOutputTarget({
      componentCorePackage: '@cscfi/test-ui',
      proxiesFile: '../test-ui-vue/lib/proxies.ts',
      includePolyfills: false,
      componentModels,
    }),
    {
      type: 'dist',
      esmLoaderPath: '../loader',
    },
    {
      type: 'dist-custom-elements',
    },
    {
      type: 'docs-readme',
    },
    {
      type: 'www',
      serviceWorker: null, // disable service workers
    },
  ],
};
