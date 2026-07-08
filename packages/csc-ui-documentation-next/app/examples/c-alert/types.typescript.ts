// @ts-nocheck — documentation code sample; shown as text, never compiled here
const wrapper = document.createElement('div');
wrapper.style.display = 'grid';
wrapper.style.gap = '1rem';

// Typed via the HTMLElementTagNameMap augmentation from @cscfi/csc-ui-next.
const defaultAlert = document.createElement('c-alert');
defaultAlert.textContent = 'A default alert without a type.';

const infoAlert = document.createElement('c-alert');
infoAlert.setAttribute('type', 'info');
infoAlert.textContent = 'Your session expires in 15 minutes.';

const successAlert = document.createElement('c-alert');
successAlert.setAttribute('type', 'success');
successAlert.textContent = 'Your project was created.';

const warningAlert = document.createElement('c-alert');
warningAlert.setAttribute('type', 'warning');
warningAlert.textContent = 'Your quota is almost full.';

const errorAlert = document.createElement('c-alert');
errorAlert.setAttribute('type', 'error');
errorAlert.textContent = 'The file could not be uploaded.';

wrapper.append(defaultAlert, infoAlert, successAlert, warningAlert, errorAlert);
document.body.append(wrapper);
