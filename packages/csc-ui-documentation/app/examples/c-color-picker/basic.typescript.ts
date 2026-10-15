const picker = document.querySelector('c-color-picker')!;

picker.addEventListener('change', (event) => {
  document.querySelector('p')!.textContent = `Value: ${event.detail ?? 'null'}`;
});
