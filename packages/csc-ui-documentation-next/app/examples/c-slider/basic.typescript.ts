// @ts-nocheck — documentation code sample; shown as text, never compiled here
const container = document.createElement('div');

// Typed via the HTMLElementTagNameMap augmentation from @cscfi/csc-ui-next.
const slider = document.createElement('c-slider');
slider.value = 40;
slider.setAttribute('label', 'Volume');

const status = document.createElement('span');
status.textContent = 'Value: 40 %';

slider.addEventListener('changeValue', (event) => {
  status.textContent = `Value: ${event.detail} %`;
});

container.append(slider, status);
document.body.append(container);
