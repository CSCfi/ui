import type { CTreeSelectItem } from '@cscfi/csc-ui';

import { CTreeSelect } from '@cscfi/csc-ui-react';
// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';

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

export const UnevenDepth = () => {
  const [field, setField] = useState<null | string>(null);

  return (
    <div>
      <CTreeSelect
        clearable
        hint="Some units have sub-units, some do not"
        items={items}
        label="Unit"
        onChange={(event) => setField(event.detail as null | string)}
        value={field}
      />

      <p>Value: {field ?? 'null'}</p>
    </div>
  );
};
