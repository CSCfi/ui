const modal = document.querySelector('c-modal')!;

const [openButton, cancelButton, deleteButton] =
  document.querySelectorAll('c-button');

openButton!.addEventListener('click', () => {
  modal.value = true;
});

cancelButton!.addEventListener('click', () => {
  modal.value = false;
});

deleteButton!.addEventListener('click', () => {
  modal.value = false;
});

modal.addEventListener('changeValue', () => {
  modal.value = false;
});
