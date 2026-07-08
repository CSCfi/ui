// @ts-nocheck — documentation code sample; shown as text, never compiled here
// Typed via the HTMLElementTagNameMap augmentation from @cscfi/csc-ui-next.
const page = document.createElement('c-page');
// Demo-only sizing: c-page normally fills the viewport below the toolbar.
page.style.height = '240px';

const heading = document.createElement('h2');
heading.textContent = 'Reports';

const description = document.createElement('p');
description.textContent =
  'The default slot is wrapped in a centered max-width container.';

const footer = document.createElement('div');
footer.slot = 'footer';
footer.textContent = 'Footer content';

page.append(heading, description, footer);
document.body.append(page);
