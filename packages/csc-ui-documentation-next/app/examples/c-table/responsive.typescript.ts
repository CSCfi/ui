// @ts-nocheck — documentation code sample; shown as text, never compiled here
const container = document.createElement('div');

// Below the breakpoint each row becomes a card with header labels.
// Typed via the HTMLElementTagNameMap augmentation from @cscfi/csc-ui-next.
const wrapper = document.createElement('c-table');
wrapper.setAttribute('responsive', '');
wrapper.setAttribute('mobile-breakpoint', '800');

const table = document.createElement('table');

const thead = document.createElement('thead');
const headerRow = document.createElement('tr');

for (const label of ['Name', 'Role', 'Email']) {
  const th = document.createElement('th');
  th.textContent = label;
  headerRow.append(th);
}

thead.append(headerRow);

const tbody = document.createElement('tbody');

const rows = [
  ['Anna Virtanen', 'Researcher', 'anna.virtanen@example.fi'],
  ['Mikko Korhonen', 'Data engineer', 'mikko.korhonen@example.fi'],
];

for (const cells of rows) {
  const tr = document.createElement('tr');

  for (const value of cells) {
    const td = document.createElement('td');
    td.textContent = value;
    tr.append(td);
  }

  tbody.append(tr);
}

table.append(thead, tbody);
wrapper.append(table);
container.append(wrapper);
document.body.append(container);
