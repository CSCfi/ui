import { mdiAccount, mdiBellOutline, mdiCheckCircle } from '@mdi/js';

const [account, bell, check] = document.querySelectorAll('c-icon');

account!.path = mdiAccount;
bell!.path = mdiBellOutline;
check!.path = mdiCheckCircle;
