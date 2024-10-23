import { Config } from '@stencil/core';
import { sass } from '@stencil/sass';
import { reactOutputTarget } from '@stencil/react-output-target';

export const config: Config = {
  namespace: 'csc-ui',
  outputTargets: [
    {
      type: 'dist',
      esmLoaderPath: '../loader',
      copy: [{ src: 'styles', dest: 'dist/', keepDirStructure: true }],
    },

    {
      type: 'dist-custom-elements',
      dir: 'dist/components',
      copy: [
        {
          src: 'styles',
          dest: 'dist/components/',
          keepDirStructure: true,
        },
      ],
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
      outDir: '../csc-ui-react/src/components/stencil-generated/',
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
