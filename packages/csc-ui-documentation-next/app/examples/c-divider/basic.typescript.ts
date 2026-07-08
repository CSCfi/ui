// @ts-nocheck — documentation code sample; shown as text, never compiled here
const container = document.createElement('div');

const profile = document.createElement('p');
profile.textContent = 'Profile';

// Typed via the HTMLElementTagNameMap augmentation from @cscfi/csc-ui-next.
const divider = document.createElement('c-divider');

const preferences = document.createElement('p');
preferences.textContent = 'Preferences';

container.append(profile, divider, preferences);
document.body.append(container);
