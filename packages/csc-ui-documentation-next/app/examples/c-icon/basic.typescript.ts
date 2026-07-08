// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { mdiAccount, mdiBellOutline, mdiCheckCircle } from '@mdi/js';

const row = document.createElement('div');
row.className = 'example-row';

// Typed via the HTMLElementTagNameMap augmentation from @cscfi/csc-ui-next.
const account = document.createElement('c-icon');
account.path = mdiAccount;

const bell = document.createElement('c-icon');
bell.path = mdiBellOutline;
bell.setAttribute('size', '36');

const check = document.createElement('c-icon');
check.path = mdiCheckCircle;
check.setAttribute('size', '36');
check.setAttribute('color', 'var(--c-success)');

row.append(account, bell, check);
document.body.append(row);
