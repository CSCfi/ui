// @ts-nocheck — documentation code sample; shown as text, never compiled here
const wrapper = document.createElement('div');

// Typed via the HTMLElementTagNameMap augmentation from @cscfi/csc-ui-next.
const tabs = document.createElement('c-tabs');
tabs.setAttribute('value', 'summary');

const panels = document.createElement('c-tab-items');
panels.slot = 'items';

const items = [
  {
    value: 'summary',
    label: 'Summary',
    content: 'Overview of the project and its recent activity.',
  },
  {
    value: 'members',
    label: 'Members',
    content: 'People with access to this project.',
  },
  {
    value: 'settings',
    label: 'Settings',
    content: 'Project name, description and visibility.',
  },
];

for (const { value, label, content } of items) {
  const tab = document.createElement('c-tab');
  tab.setAttribute('value', value);
  tab.textContent = label;
  tabs.append(tab);

  const panel = document.createElement('c-tab-item');
  panel.setAttribute('value', value);

  const paragraph = document.createElement('p');
  paragraph.textContent = content;
  panel.append(paragraph);

  panels.append(panel);
}

tabs.append(panels);
wrapper.append(tabs);
document.body.append(wrapper);
