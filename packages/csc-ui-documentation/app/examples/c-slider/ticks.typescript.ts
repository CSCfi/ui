let cores = 2;

const slider = document.querySelector('c-slider')!;
slider.value = cores;

slider.addEventListener('changeValue', (event) => {
  cores = event.detail as number;
});
