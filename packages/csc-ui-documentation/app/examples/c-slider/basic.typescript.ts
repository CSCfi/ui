const slider = document.querySelector('c-slider')!;
slider.value = 40;

const status = document.querySelector('p')!;

slider.addEventListener('update:value', (event) => {
  status.textContent = `Value: ${event.detail} %`;
});
