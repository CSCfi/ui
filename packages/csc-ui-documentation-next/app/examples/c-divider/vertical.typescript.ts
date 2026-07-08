// @ts-nocheck — documentation code sample; shown as text, never compiled here
const row = document.createElement('div');
row.className = 'example-row';

const details = document.createElement('span');
details.textContent = 'Details';

// Typed via the HTMLElementTagNameMap augmentation from @cscfi/csc-ui-next.
const firstDivider = document.createElement('c-divider');
firstDivider.setAttribute('vertical', '');

const members = document.createElement('span');
members.textContent = 'Members';

const secondDivider = document.createElement('c-divider');
secondDivider.setAttribute('vertical', '');

const settings = document.createElement('span');
settings.textContent = 'Settings';

row.append(details, firstDivider, members, secondDivider, settings);
document.body.append(row);
