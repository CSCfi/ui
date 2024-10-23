import { Config } from '@stencil/core';
import { sass } from '@stencil/sass';
import { reactOutputTarget } from '@stencil/react-output-target';
import {
  vueOutputTarget,
  ComponentModelConfig,
} from '@stencil/vue-output-target';

const componentModels: ComponentModelConfig[] = [
  {
    elements: [
      'c-accordion',
      'c-autocomplete',
      'c-checkbox',
      'c-input',
      'c-modal',
      'c-otp-input',
      'c-pagination',
      'c-radio-group',
      'c-select',
      'c-slider',
      'c-steps',
      'c-swiper',
      'c-swiper-tab',
      'c-switch',
      'c-tab-buttons',
      'c-tabs',
      'c-text-field',
    ],
    event: 'changeValue',
    targetAttr: 'value',
  },
];

export const config: Config = {
  namespace: 'csc-ui',
  outputTargets: [
    {
      type: 'dist',
      copy: [{ src: 'styles', dest: 'dist/styles' }],
    },

    {
      type: 'dist-custom-elements',
      dir: 'dist/components',
      copy: [{ src: 'styles', dest: 'dist/components/styles' }],
      customElementsExportBehavior: 'single-export-module',
      externalRuntime: false,
    },

    {
      type: 'docs-readme',
    },

    {
      type: 'docs-json',
      file: 'docs.json',
    },

    {
      type: 'docs-vscode',
      file: 'vscode-data.json',
    },

    {
      type: 'www',
      serviceWorker: null, // disable service workers
    },

    reactOutputTarget({
      customElementsDir: 'components',
      outDir: '../csc-ui-for-react/src/components/stencil-generated/',
    }),

    vueOutputTarget({
      customElementsDir: 'components',
      componentCorePackage: '@cscfi/csc-ui',
      proxiesFile: '../csc-ui-for-vue/lib/components.ts',
      componentModels: componentModels,
    }),
  ],
  plugins: [
    sass({
      injectGlobalPaths: ['src/assets/global.scss'],
    }),
  ],
  extras: {
    experimentalImportInjection: true,
  },
};
