import type { CTreeSelectItem } from '@cscfi/csc-ui';

const items: CTreeSelectItem[] = [
  {
    value: 'research',
    name: 'Research services',
    children: [
      {
        value: 'computing',
        name: 'Computing',
        children: [
          { value: 'hpc', name: 'High-performance computing' },
          { value: 'cloud', name: 'Cloud services' },
          { value: 'quantum', name: 'Quantum computing', disabled: true },
        ],
      },
      { value: 'data', name: 'Data management' },
    ],
  },
  {
    value: 'education',
    name: 'Education',
    children: [
      { value: 'training', name: 'Training' },
      { value: 'materials', name: 'Learning materials' },
    ],
  },
  {
    value: 'administration',
    name: 'Administration',
    disabled: true,
    children: [{ value: 'hr', name: 'Human resources' }],
  },
  { value: 'communications', name: 'Communications' },
];

// Arrays, objects and functions have no attribute form: set them as DOM
// properties.
const treeSelect = document.querySelector('c-tree-select')!;
treeSelect.items = items;

treeSelect.addEventListener('change', (event) => {
  document.querySelector('p')!.textContent = `Value: ${event.detail ?? 'null'}`;
});
