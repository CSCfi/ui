// @ts-nocheck — documentation code sample; shown as text, never compiled here
const container = document.createElement('div');

// Typed via the HTMLElementTagNameMap augmentation from @cscfi/csc-ui-next.
const otp = document.createElement('c-otp-input');
otp.setAttribute('label', 'OTP');
otp.setAttribute('hint', 'Enter the 6-digit code we sent you');

const status = document.createElement('span');
status.textContent = 'Code: incomplete';

otp.addEventListener('changeValue', (event) => {
  status.textContent = `Code: ${event.detail ?? 'incomplete'}`;
});

container.append(otp, status);
document.body.append(container);
