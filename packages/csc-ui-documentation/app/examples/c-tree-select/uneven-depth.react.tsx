// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';
import { CTreeSelect } from '@cscfi/csc-ui-react';
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

export const UnevenDepth = () => {
  const [field, setField] = useState<string | null>(null);

  return (
    <div>
      <CTreeSelect
        value={field}
        items={items}
        hint="Some units have sub-units, some do not"
        label="Unit"
        clearable
        onChange={(event) => setField(event.detail as string | null)}
      />

      <p>Value: {field ?? 'null'}</p>
    </div>
  );
};
