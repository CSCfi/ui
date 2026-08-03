const group = document.querySelector('c-radio-group')!;

group.addEventListener('changeValue', (event) => {
  group.value = event.detail;
});
