// @ts-nocheck — documentation code sample; shown as text, never compiled here
let expanded: 'billing' | 'members' | 'storage' = 'billing';

// Typed via the HTMLElementTagNameMap augmentation from @cscfi/csc-ui-next.
const accordion = document.createElement('c-accordion');
accordion.value = expanded;

accordion.addEventListener('changeValue', (event) => {
  expanded = event.detail as 'billing' | 'members' | 'storage';
});

const items = [
  {
    heading: 'Project billing',
    value: 'billing',
    text: 'Billing units are deducted monthly based on the resources in use.',
  },
  {
    heading: 'Members and roles',
    value: 'members',
    text: 'Invite members by email and assign them a role in the project.',
  },
  {
    heading: 'Data storage',
    value: 'storage',
    text: 'Allas object storage is available to every project by default.',
  },
];

for (const { heading, value, text } of items) {
  const item = document.createElement('c-accordion-item');
  item.setAttribute('heading', heading);
  item.setAttribute('value', value);

  const paragraph = document.createElement('p');
  paragraph.textContent = text;

  item.append(paragraph);
  accordion.append(item);
}

document.body.append(accordion);
