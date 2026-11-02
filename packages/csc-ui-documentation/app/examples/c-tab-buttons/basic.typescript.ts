let tab: 'members' | 'overview' | 'settings' = 'overview';

document.querySelector('c-tabs')!.addEventListener('change', (event) => {
  tab = event.detail as 'members' | 'overview' | 'settings';
});
