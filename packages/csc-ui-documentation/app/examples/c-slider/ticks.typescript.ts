let cores = 2;

const slider = document.querySelector('c-slider')!;
slider.value = cores;

slider.addEventListener('update:value', (event) => {
  cores = event.detail as number;
});
