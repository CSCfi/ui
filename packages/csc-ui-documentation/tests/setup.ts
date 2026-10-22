// The document-level pieces the docs site gives every canon: the tokens, the
// residual stylesheet the example SFCs reference, and the registered elements
// from the built package (app/plugins/csc-ui.client.ts). The page frame is the
// library harness's own: components inherit the page typography (ADR-0072), so
// the smoke shares the font stack and 1.5 leading of the docs demo pane and
// the csc-ui baselines instead of keeping a copy that can drift.
import '@cscfi/csc-ui/css/tokens.css';

import '../app/assets/site.css';
import '../../csc-ui/src/test/harness.css';

import { defineCustomElements } from '@cscfi/csc-ui';
import { afterEach, beforeEach } from 'vitest';

defineCustomElements();

beforeEach(() => {
  document.documentElement.setAttribute('data-theme', 'light');
});

afterEach(() => {
  document.body.replaceChildren();
  document.documentElement.setAttribute('data-theme', 'light');
});
