import { Config } from '@stencil/core';
import { sass } from '@stencil/sass';

export const config: Config = {
  namespace: 'csc-ui',
  outputTargets: [
    {
      type: 'dist',
      copy: [{ src: 'styles', dest: 'dist/styles' }],
    },
    {
      type: 'dist-custom-elements',
      copy: [{ src: 'styles', dest: 'dist/styles' }],
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
      injectGlobalPaths: ['src/assets/global.scss'],
    }),
  ],
  extras: {
    experimentalImportInjection: true,
  },
};
