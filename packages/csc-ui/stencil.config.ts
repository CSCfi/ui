import { Config } from '@stencil/core';
import { sass } from '@stencil/sass';
import {
  ComponentModelConfig,
  vueOutputTarget,
} from '@stencil/vue-output-target';
import { reactOutputTarget } from '@stencil/react-output-target';

const componentModels: ComponentModelConfig[] = [
  {
    elements: ['c-text-field'],
    event: 'changeValue',
    // externalEvent: 'change',
    targetAttr: 'value',
  },
];

export const config: Config = {
  namespace: 'csc-ui',
  outputTargets: [
    vueOutputTarget({
      componentCorePackage: '@cscfi/csc-ui',
      proxiesFile: '../csc-ui-vue-library/lib/proxies.ts',
      includePolyfills: true,
      componentModels,
    }),
    reactOutputTarget({
      componentCorePackage: '@cscfi/csc-ui',
      proxiesFile: '../csc-ui-react/lib/components/stencil-generated/index.ts',
    }),
    {
      type: 'dist-custom-elements',
    },
    {
      type: 'dist',
      esmLoaderPath: '../loader',
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
  ],
  plugins: [
    sass({
      injectGlobalPaths: [
        'src/styles/global.scss',
        'src/styles/variables.css',
        'src/styles/variables.scss',
      ],
    }),
  ],
  extras: {
    experimentalImportInjection: true,
  },
};
