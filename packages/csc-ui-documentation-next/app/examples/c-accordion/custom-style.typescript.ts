// @ts-nocheck — documentation code sample; shown as text, never compiled here
const styles = document.createElement('style');
styles.textContent = `
:root, :root[data-theme='light'] {
  --accordion-content-background: var(--c-surface);
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme]) {
    --accordion-content-background: color-mix(in srgb, var(--c-primary) 20%, transparent);
  }
}

:root[data-theme='dark'] {
  --accordion-content-background: color-mix(in srgb, var(--c-primary) 20%, transparent);
}

c-accordion.custom-style {
  c-accordion-item {
    &::part(root) {
      border: 1px solid var(--c-border);
    }

    &::part(header) {
      background-color: transparent;
    }

    &::part(content) {
      margin: 8px;
      padding: 8px;
      border-radius: 4px;
      background-color: var(--accordion-content-background);
    }

    &[expanded]::part(root) {
      border-color: var(--c-primary);
      background-color: color-mix(in srgb, var(--c-primary) 10%, transparent);
    }
  }
}
`;
document.head.append(styles);

let expanded: 'billing' | 'members' | 'storage' = 'billing';

// Typed via the HTMLElementTagNameMap augmentation from @cscfi/csc-ui-next.
const accordion = document.createElement('c-accordion');
accordion.className = 'custom-style';
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
