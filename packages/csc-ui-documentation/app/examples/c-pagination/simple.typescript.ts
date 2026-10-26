const pagination = document.querySelector('c-pagination')!;

const status = document.querySelector('p')!;

pagination.value = {
  itemCount: 40,
  itemsPerPage: 10,
};

pagination.addEventListener('change', (event) => {
  status.textContent = `Current page: ${event.detail.currentPage ?? 1}`;
});
