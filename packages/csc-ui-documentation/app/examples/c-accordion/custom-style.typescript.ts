let expanded: 'billing' | 'members' | 'storage' = 'billing';

document.querySelector('c-accordion')!.addEventListener('change', (event) => {
  expanded = event.detail as 'billing' | 'members' | 'storage';
});
