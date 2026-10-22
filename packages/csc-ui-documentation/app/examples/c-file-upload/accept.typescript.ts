const field = document.querySelector('c-file-upload')!;

const refused = document.querySelector('p')!;

// The latest add's refusals, cleared by the next change to the list — the
// `reject` event follows the `change` of the same add.
field.addEventListener('change', () => {
  refused.textContent = 'Refused: none';
});

field.addEventListener('reject', (event) => {
  const names = event.detail
    .map(({ file, reason }) => `${file.name} (${reason})`)
    .join(', ');

  refused.textContent = `Refused: ${names}`;
});
