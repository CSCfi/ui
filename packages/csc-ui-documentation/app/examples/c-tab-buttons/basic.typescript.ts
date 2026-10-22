let tab: 'members' | 'overview' | 'settings' = 'overview';

document.querySelector('c-tabs')!.addEventListener('changeValue', (event) => {
  tab = event.detail as 'members' | 'overview' | 'settings';
});
