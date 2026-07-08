// @ts-nocheck — documentation code sample; shown as text, never compiled here
const wrapper = document.createElement('div');

// Typed via the HTMLElementTagNameMap augmentation from @cscfi/csc-ui-next.
const pagination = document.createElement('c-pagination');
pagination.value = {
  itemCount: 40,
  itemsPerPage: 10,
};
pagination.setAttribute('hide-details', '');
pagination.setAttribute('simple', '');

const status = document.createElement('p');
status.textContent = 'Current page: 1';

pagination.addEventListener('changeValue', (event) => {
  status.textContent = `Current page: ${event.detail.currentPage ?? 1}`;
});

wrapper.append(pagination, status);
document.body.append(wrapper);
