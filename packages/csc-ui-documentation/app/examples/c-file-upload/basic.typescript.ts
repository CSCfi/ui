const field = document.querySelector('c-file-upload')!;

field.addEventListener('change', (event) => {
  const names = event.detail.map((file) => file.name).join(', ');

  document.querySelector('p')!.textContent = `Files: ${names || 'none'}`;
});
