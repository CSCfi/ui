// @ts-nocheck — documentation code sample; shown as text, never compiled here
const row = document.createElement('div');
row.className = 'example-row';

// Typed via the HTMLElementTagNameMap augmentation from @cscfi/csc-ui-next.
const tags = document.createElement('c-tags');

for (const topic of ['Biosciences', 'Chemistry', 'Physics']) {
  const tag = document.createElement('c-tag');
  tag.setAttribute('closeable', '');
  tag.textContent = topic;

  tag.addEventListener('close', () => {
    tag.remove();
  });

  tags.append(tag);
}

row.append(tags);
document.body.append(row);
