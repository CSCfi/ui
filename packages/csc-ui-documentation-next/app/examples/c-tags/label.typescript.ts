// @ts-nocheck — documentation code sample; shown as text, never compiled here
// Typed via the HTMLElementTagNameMap augmentation from @cscfi/csc-ui-next.
const tags = document.createElement('c-tags');
tags.setAttribute('label', 'Research fields');
tags.setAttribute('required', '');

for (const field of ['All', 'Biosciences', 'Chemistry', 'Physics']) {
  const tag = document.createElement('c-tag');

  if (field === 'All') tag.setAttribute('active', '');
  tag.textContent = field;
  tags.append(tag);
}

document.body.append(tags);
