// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';

@Component({
  selector: 'app-example',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="example-row">
      <c-button-group
        label="Toppings"
        multiple
        [value]="toppings()"
        (change)="toppings.set($any($event).detail)"
      >
        <c-button value="cheese">Cheese</c-button>
        <c-button value="pepperoni">Pepperoni</c-button>
        <c-button value="mushroom">Mushroom</c-button>
      </c-button-group>

      <span>
        Selected: {{ toppings().length ? toppings().join(', ') : 'none' }}
      </span>
    </div>
  `,
})
export class MultipleExampleComponent {
  toppings = signal<string[]>(['cheese']);
}
