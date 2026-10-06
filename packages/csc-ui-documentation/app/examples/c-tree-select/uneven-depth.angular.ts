import type { CTreeSelectItem } from '@cscfi/csc-ui';

// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';

@Component({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  selector: 'app-example',
  standalone: true,
  template: `
    <div>
      <c-tree-select
        [items]="items"
        [value]="field()"
        hint="Some units have sub-units, some do not"
        label="Unit"
        clearable
        (change)="field.set($any($event).detail)"
      ></c-tree-select>

      <p>Value: {{ field() ?? 'null' }}</p>
    </div>
  `,
})
export class UnevenDepthExampleComponent {
  field = signal<null | string>(null);

  items: CTreeSelectItem[] = [
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
}
