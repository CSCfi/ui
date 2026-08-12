const loader = document.querySelector('c-loader')!;

document.querySelector('c-button')!.addEventListener('click', () => {
  loader.visible = !loader.visible;
});
