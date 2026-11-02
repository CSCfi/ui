const pagination = document.querySelector('c-pagination')!;

const current = document.querySelector('p')!;

pagination.value = {
  itemCount: 96,
  pageSize: 10,
  pageSizes: [10, 25, 50],
};

pagination.addEventListener('change', (event) => {
  current.textContent = `Current page: ${event.detail.page ?? 1}`;
});
