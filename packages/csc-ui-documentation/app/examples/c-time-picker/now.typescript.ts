const picker = document.querySelector('c-time-picker')!;

picker.addEventListener('change', (event) => {
  document.querySelector('p')!.textContent = `Value: ${event.detail ?? 'null'}`;
});
