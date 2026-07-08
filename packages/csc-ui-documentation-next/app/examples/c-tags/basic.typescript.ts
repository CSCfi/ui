// @ts-nocheck — documentation code sample; shown as text, never compiled here
const grid = document.createElement('div');
grid.style.display = 'grid';
grid.style.gap = '1rem';

// Typed via the HTMLElementTagNameMap augmentation from @cscfi/csc-ui-next.
const tags = document.createElement('c-tags');

for (const label of ['All', 'Biosciences', 'Chemistry', 'Physics']) {
  const tag = document.createElement('c-tag');
  tag.textContent = label;

  if (label === 'All') {
    tag.setAttribute('active', '');
  }

  tags.append(tag);
}

const smallTags = document.createElement('c-tags');
smallTags.setAttribute('size', 'small');

for (const label of ['All', 'Biosciences', 'Chemistry', 'Physics']) {
  const tag = document.createElement('c-tag');
  tag.textContent = label;

  if (label === 'All') {
    tag.setAttribute('active', '');
  }

  smallTags.append(tag);
}

grid.append(tags, smallTags);
document.body.append(grid);
