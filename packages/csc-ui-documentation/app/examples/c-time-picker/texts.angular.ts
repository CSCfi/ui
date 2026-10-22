import type { CTimePickerRange, CTimePickerTexts } from '@cscfi/csc-ui';

// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';

const texts: CTimePickerTexts = {
  am: 'ap.',
  chooseTime: 'Valitse aika',
  clearSelection: 'Tyhjennä',
  closePanel: 'Sulje',
  done: 'Valmis',
  end: 'Loppuaika',
  hours: 'Tunnit',
  minutes: 'Minuutit',
  now: 'Nyt',
  openClock: 'Avaa kellonajan valinta',
  period: 'ap./ip.',
  pm: 'ip.',
  start: 'Alkuaika',
};

@Component({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  selector: 'app-example',
  standalone: true,
  template: `
    <div>
      <c-time-picker
        [value]="shift()"
        [texts]="texts"
        format="H.mm"
        hint="Kirjoita ajat tai valitse listoista"
        label="Työvuoro"
        range
        (change)="shift.set($any($event).detail)"
      ></c-time-picker>

      <p>
        Value: {{ shift() ? shift()!.start + ' – ' + shift()!.end : 'null' }}
      </p>
    </div>
  `,
})
export class TextsExampleComponent {
  shift = signal<CTimePickerRange | null>(null);
  texts = texts;
}
