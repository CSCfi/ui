// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';
import type { CTreeSelectItem } from '@cscfi/csc-ui';

@Component({
  selector: 'app-example',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
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
  items: CTreeSelectItem[] = [
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

  field = signal<string | null>(null);
}
