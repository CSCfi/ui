// @ts-nocheck — documentation code sample; shown as text, never compiled here
const row = document.createElement('div');
row.className = 'example-row';

// Typed via the HTMLElementTagNameMap augmentation from @cscfi/csc-ui-next.
const tabButtons = document.createElement('c-tab-buttons');
tabButtons.setAttribute('value', 'list');
tabButtons.setAttribute('mandatory', '');

const listButton = document.createElement('c-tab-button');
listButton.setAttribute('value', 'list');
listButton.textContent = 'List';

const gridButton = document.createElement('c-tab-button');
gridButton.setAttribute('value', 'grid');
gridButton.textContent = 'Grid';

tabButtons.append(listButton, gridButton);

const smallTabButtons = document.createElement('c-tab-buttons');
smallTabButtons.setAttribute('size', 'small');
smallTabButtons.setAttribute('value', 'list');
smallTabButtons.setAttribute('mandatory', '');

const smallListButton = document.createElement('c-tab-button');
smallListButton.setAttribute('value', 'list');
smallListButton.textContent = 'List';

const smallGridButton = document.createElement('c-tab-button');
smallGridButton.setAttribute('value', 'grid');
smallGridButton.textContent = 'Grid';

smallTabButtons.append(smallListButton, smallGridButton);

row.append(tabButtons, smallTabButtons);
document.body.append(row);
