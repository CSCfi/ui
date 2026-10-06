import type { CTreeSelectItem } from '@cscfi/csc-ui';

const items: CTreeSelectItem[] = [
  {
    children: [
      {
        children: [
          { name: 'High-performance computing', value: 'hpc' },
          { name: 'Cloud services', value: 'cloud' },
          { disabled: true, name: 'Quantum computing', value: 'quantum' },
        ],
        name: 'Computing',
        value: 'computing',
      },
      { name: 'Data management', value: 'data' },
    ],
    name: 'Research services',
    value: 'research',
  },
  {
    children: [
      { name: 'Training', value: 'training' },
      { name: 'Learning materials', value: 'materials' },
    ],
    name: 'Education',
    value: 'education',
  },
  {
    children: [{ name: 'Human resources', value: 'hr' }],
    disabled: true,
    name: 'Administration',
    value: 'administration',
  },
  { name: 'Communications', value: 'communications' },
];

// Arrays, objects and functions have no attribute form: set them as DOM
// properties.
const treeSelect = document.querySelector('c-tree-select')!;
treeSelect.items = items;

treeSelect.addEventListener('change', (event) => {
  document.querySelector('p')!.textContent = `Value: ${event.detail ?? 'null'}`;
});
