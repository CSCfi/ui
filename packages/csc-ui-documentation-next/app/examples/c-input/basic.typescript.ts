const field = document.querySelector('c-input')!;

const input = document.querySelector('input')!;

input.addEventListener('input', () => {
  field.filled = input.value.length > 0;
});
