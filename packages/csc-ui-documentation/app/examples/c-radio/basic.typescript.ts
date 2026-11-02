const group = document.querySelector('c-radio-group')!;

group.addEventListener('change', (event) => {
  group.value = event.detail;
});
