const otp = document.querySelector('c-otp-input')!;

const status = document.querySelector('p')!;

otp.addEventListener('update:value', (event) => {
  status.textContent = `Code: ${event.detail}`;
});
