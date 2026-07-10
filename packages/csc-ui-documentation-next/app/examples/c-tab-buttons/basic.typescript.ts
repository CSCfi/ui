// @ts-nocheck — documentation code sample; shown as text, never compiled here
// Typed via the HTMLElementTagNameMap augmentation from @cscfi/csc-ui-next.
const tabs = document.createElement('c-tabs');
tabs.value = 'overview';

const tabButtons = document.createElement('c-tab-buttons');

const items = document.createElement('c-tab-items');
items.slot = 'items';

const panels: Record<string, string> = {
  overview: 'Overview of the project and its recent activity.',
  members: 'People with access to this project.',
  settings: 'Project name, description and visibility.',
};

for (const [value, text] of Object.entries(panels)) {
  const button = document.createElement('c-button');
  button.setAttribute('value', value);
  button.textContent = value.charAt(0).toUpperCase() + value.slice(1);

  tabButtons.append(button);

  const item = document.createElement('c-tab-item');
  item.setAttribute('value', value);

  const p = document.createElement('p');
  p.textContent = text;

  item.append(p);
  items.append(item);
}

tabs.append(tabButtons, items);

tabs.addEventListener('changeValue', (event) => {
  console.log('active tab:', event.detail);
});

document.body.append(tabs);
