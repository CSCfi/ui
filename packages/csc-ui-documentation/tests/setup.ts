// The document-level pieces the docs site gives every canon: the tokens, the
// residual stylesheet the example SFCs reference, and the registered elements
// from the built package (app/plugins/csc-ui.client.ts).
import '@cscfi/csc-ui/css/tokens.css';
import '../app/assets/site.css';

import { defineCustomElements } from '@cscfi/csc-ui';
import { afterEach, beforeEach } from 'vitest';

defineCustomElements();

const style = document.createElement('style');

style.textContent =
  'body { margin: 0; padding: 16px; background: var(--c-surface); color: var(--c-on-surface); }';
document.head.append(style);

beforeEach(() => {
  document.documentElement.setAttribute('data-theme', 'light');
});

afterEach(() => {
  document.body.replaceChildren();
  document.documentElement.setAttribute('data-theme', 'light');
});
