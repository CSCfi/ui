const form = document.querySelector('form')!;

const status = form.querySelector('p')!;

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const data = new FormData(form);

  status.textContent = `Logged in as ${data.get('username')}`;
});
