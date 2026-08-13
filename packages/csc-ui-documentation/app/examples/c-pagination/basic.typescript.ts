const pagination = document.querySelector('c-pagination')!;

const current = document.querySelector('p')!;

pagination.value = {
  itemCount: 96,
  itemsPerPage: 10,
  pageSizes: [10, 25, 50],
};

pagination.addEventListener('changeValue', (event) => {
  current.textContent = `Current page: ${event.detail.currentPage ?? 1}`;
});
