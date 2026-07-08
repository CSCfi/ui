// @ts-nocheck — documentation code sample; shown as text, never compiled here
const container = document.createElement('div');
container.style.cssText = 'display: grid; gap: 12px; justify-items: start';

const button = document.createElement('c-button');
button.textContent = 'Toggle loader';

// The loader fills the nearest position: relative ancestor
const wrapper = document.createElement('div');
wrapper.style.cssText = 'position: relative; height: 160px; width: 100%';

// Typed via the HTMLElementTagNameMap augmentation from @cscfi/csc-ui-next.
const loader = document.createElement('c-loader');
loader.visible = true;
loader.setAttribute('contentdelay', '1');
loader.textContent = 'Loading resources';

button.addEventListener('click', () => {
  loader.visible = !loader.visible;
});

wrapper.append(loader);
container.append(button, wrapper);
document.body.append(container);
