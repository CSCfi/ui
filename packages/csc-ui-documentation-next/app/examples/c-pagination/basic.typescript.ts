// @ts-nocheck — documentation code sample; shown as text, never compiled here
const wrapper = document.createElement('div');

// Typed via the HTMLElementTagNameMap augmentation from @cscfi/csc-ui-next.
const pagination = document.createElement('c-pagination');
pagination.value = {
  itemCount: 96,
  itemsPerPage: 10,
  pageSizes: [10, 25, 50],
};

const current = document.createElement('p');
current.textContent = 'Current page: 1';

pagination.addEventListener('changeValue', (event) => {
  current.textContent = `Current page: ${event.detail.currentPage ?? 1}`;
});

wrapper.append(pagination, current);
document.body.append(wrapper);
