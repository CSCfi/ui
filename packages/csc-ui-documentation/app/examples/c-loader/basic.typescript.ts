const loader = document.querySelector('c-loader')!;

document.querySelector('c-button')!.addEventListener('click', () => {
  loader.hide = !loader.hide;
});
