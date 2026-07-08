// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';
import { mdiMemory, mdiRocket, mdiServer } from '@mdi/js';

@Component({
  selector: 'app-example',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div>
      <c-swiper
        [value]="flavor()"
        (changeValue)="flavor.set($any($event).detail)"
      >
        <c-swiper-tab value="standard" label="Standard">
          <c-icon slot="icon" [path]="mdiServer"></c-icon>
          4 cores, 8 GB RAM
        </c-swiper-tab>
        <c-swiper-tab value="performance" label="Performance">
          <c-icon slot="icon" [path]="mdiMemory"></c-icon>
          8 cores, 32 GB RAM
        </c-swiper-tab>
        <c-swiper-tab value="gpu" label="GPU">
          <c-icon slot="icon" [path]="mdiRocket"></c-icon>
          1 GPU, 112 GB RAM
        </c-swiper-tab>
      </c-swiper>

      <p>Selected flavor: {{ flavor() }}</p>
    </div>
  `,
})
export class BasicExampleComponent {
  flavor = signal<number | string>('standard');

  mdiServer = mdiServer;
  mdiMemory = mdiMemory;
  mdiRocket = mdiRocket;
}
