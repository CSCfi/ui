import { mdiBellOutline, mdiEmailOutline } from '@mdi/js';

const [bellIcon, emailIcon] = document.querySelectorAll('c-icon');

bellIcon!.path = mdiBellOutline;
emailIcon!.path = mdiEmailOutline;
