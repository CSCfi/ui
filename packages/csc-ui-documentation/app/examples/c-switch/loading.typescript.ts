const toggle = document.querySelector('c-switch')!;

const status = document.querySelector('p')!;

// Simulated round trip: `loading` shows the spinner in place of the handle
// and `disabled` refuses further input until the server has answered.
// `loading` alone does not block clicks.
toggle.addEventListener('changeValue', (event) => {
  toggle.loading = true;
  toggle.disabled = true;
  status.textContent = 'Saving…';

  window.setTimeout(() => {
    toggle.value = event.detail;
    toggle.loading = false;
    toggle.disabled = false;
    status.textContent = `Value: ${event.detail}`;
  }, 1500);
});
