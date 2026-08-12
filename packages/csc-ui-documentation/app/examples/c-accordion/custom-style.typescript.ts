let expanded: 'billing' | 'members' | 'storage' = 'billing';

document
  .querySelector('c-accordion')!
  .addEventListener('changeValue', (event) => {
    expanded = event.detail as 'billing' | 'members' | 'storage';
  });
