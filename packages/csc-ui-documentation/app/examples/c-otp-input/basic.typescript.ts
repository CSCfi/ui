const otp = document.querySelector('c-otp-input')!;

const status = document.querySelector('p')!;

otp.addEventListener('changeValue', (event) => {
  status.textContent = `Code: ${event.detail ?? 'incomplete'}`;
});
