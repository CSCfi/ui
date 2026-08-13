const button = document.querySelector('c-navigation-button')!;
const status = document.querySelector('p')!;

let menuVisible = false;

button.addEventListener('click', () => {
  menuVisible = !menuVisible;
  status.textContent = `Menu ${menuVisible ? 'open' : 'closed'}`;
});
