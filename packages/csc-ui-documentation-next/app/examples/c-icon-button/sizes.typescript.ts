// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { mdiMagnify } from '@mdi/js';

const row = document.createElement('div');
row.className = 'example-row';

// Typed via the HTMLElementTagNameMap augmentation from @cscfi/csc-ui-next.
const xSmallButton = document.createElement('c-icon-button');
xSmallButton.setAttribute('size', 'x-small');

const xSmallIcon = document.createElement('c-icon');
xSmallIcon.path = mdiMagnify;

xSmallButton.append(xSmallIcon);

const smallButton = document.createElement('c-icon-button');
smallButton.setAttribute('size', 'small');

const smallIcon = document.createElement('c-icon');
smallIcon.path = mdiMagnify;

smallButton.append(smallIcon);

const defaultButton = document.createElement('c-icon-button');

const defaultIcon = document.createElement('c-icon');
defaultIcon.path = mdiMagnify;

defaultButton.append(defaultIcon);

row.append(xSmallButton, smallButton, defaultButton);
document.body.append(row);
