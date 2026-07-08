// @ts-nocheck — documentation code sample; shown as text, never compiled here
const row = document.createElement('div');
row.className = 'example-row';

// Typed via the HTMLElementTagNameMap augmentation from @cscfi/csc-ui-next.
const defaultTag = document.createElement('c-tag');
defaultTag.textContent = 'Default';

const activeTag = document.createElement('c-tag');
activeTag.setAttribute('active', '');
activeTag.textContent = 'Active';

const badgeTag = document.createElement('c-tag');
badgeTag.setAttribute('badge', '3');
badgeTag.textContent = 'With badge';

const flatTag = document.createElement('c-tag');
flatTag.setAttribute('flat', '');
flatTag.textContent = 'Flat';

const smallTag = document.createElement('c-tag');
smallTag.setAttribute('size', 'small');
smallTag.textContent = 'Small';

row.append(defaultTag, activeTag, badgeTag, flatTag, smallTag);
document.body.append(row);
