let tab: 'overview' | 'members' | 'settings' = 'overview';

document.querySelector('c-tabs')!.addEventListener('changeValue', (event) => {
  tab = event.detail as 'overview' | 'members' | 'settings';
});
