// @ts-nocheck — documentation code sample; shown as text, never compiled here
import {
  mdiBellOutline,
  mdiDelete,
  mdiDotsVertical,
  mdiHeart,
  mdiPencil,
  mdiPlus,
} from '@mdi/js';

const row = document.createElement('div');
row.className = 'example-row';

// Typed via the HTMLElementTagNameMap augmentation from @cscfi/csc-ui-next.
const createButton = (path: string) => {
  const button = document.createElement('c-icon-button');
  const icon = document.createElement('c-icon');
  icon.path = path;
  button.append(icon);

  return button;
};

const basic = createButton(mdiPlus);

const outlined = createButton(mdiPencil);
outlined.setAttribute('outlined', '');

const ghost = createButton(mdiHeart);
ghost.setAttribute('ghost', '');

const text = createButton(mdiDotsVertical);
text.setAttribute('text', '');

const danger = createButton(mdiDelete);
danger.setAttribute('danger', '');

const badge = createButton(mdiBellOutline);
badge.setAttribute('badge', '3');

const disabled = createButton(mdiPlus);
disabled.setAttribute('disabled', '');

row.append(basic, outlined, ghost, text, danger, badge, disabled);
document.body.append(row);
