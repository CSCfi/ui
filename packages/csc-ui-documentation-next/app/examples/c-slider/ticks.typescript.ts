// @ts-nocheck — documentation code sample; shown as text, never compiled here
const container = document.createElement('div');

let cores = 2;

// Typed via the HTMLElementTagNameMap augmentation from @cscfi/csc-ui-next.
const slider = document.createElement('c-slider');
slider.value = cores;
slider.setAttribute('label', 'CPU cores');
slider.setAttribute('labels', '');
slider.setAttribute('max', '8');
slider.setAttribute('min', '0');
slider.setAttribute('segments', '8');
slider.setAttribute('step', '1');
slider.setAttribute('ticks', '');
slider.setAttribute('unit', '');

slider.addEventListener('changeValue', (event) => {
  cores = event.detail as number;
});

container.append(slider);
document.body.append(container);
