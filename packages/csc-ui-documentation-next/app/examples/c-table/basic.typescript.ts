// @ts-nocheck — documentation code sample; shown as text, never compiled here
const wrapper = document.createElement('div');

// Typed via the HTMLElementTagNameMap augmentation from @cscfi/csc-ui-next.
const cTable = document.createElement('c-table');

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
  ['Sara Niemi', 'Project manager', 'sara.niemi@example.fi'],
];

for (const cells of rows) {
  const tr = document.createElement('tr');

  for (const cell of cells) {
    const td = document.createElement('td');
    td.textContent = cell;
    tr.append(td);
  }

  tbody.append(tr);
}

table.append(thead, tbody);
cTable.append(table);
wrapper.append(cTable);
document.body.append(wrapper);
