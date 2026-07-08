// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { mdiMemory, mdiRocket, mdiServer } from '@mdi/js';

@Component({
  selector: 'app-example',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div>
      <c-swiper value="standard">
        <c-swiper-tab value="standard" label="Standard">
          <c-icon slot="icon" [path]="mdiServer"></c-icon>
          4 cores, 8 GB RAM
        </c-swiper-tab>
        <c-swiper-tab value="performance" label="Performance">
          <c-icon slot="icon" [path]="mdiMemory"></c-icon>
          8 cores, 32 GB RAM
        </c-swiper-tab>
        <c-swiper-tab value="gpu" label="GPU" disabled>
          <c-icon slot="icon" [path]="mdiRocket"></c-icon>
          1 GPU, 112 GB RAM
        </c-swiper-tab>
      </c-swiper>
    </div>
  `,
})
export class BasicExampleComponent {
  mdiServer = mdiServer;
  mdiMemory = mdiMemory;
  mdiRocket = mdiRocket;
}
