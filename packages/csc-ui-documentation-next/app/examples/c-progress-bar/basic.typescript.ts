// @ts-nocheck — documentation code sample; shown as text, never compiled here
const wrapper = document.createElement('div');

// Typed via the HTMLElementTagNameMap augmentation from @cscfi/csc-ui-next.
const progressBar = document.createElement('c-progress-bar');
progressBar.setAttribute('value', '72');
progressBar.setAttribute('label', 'Uploading files');

wrapper.append(progressBar);
document.body.append(wrapper);
