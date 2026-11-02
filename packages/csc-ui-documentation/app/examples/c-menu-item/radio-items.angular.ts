// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {
  mdiChevronDown,
  mdiMonitor,
  mdiThemeLightDark,
  mdiWeatherNight,
  mdiWeatherSunny,
} from '@mdi/js';

@Component({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  selector: 'app-example',
  standalone: true,
  template: `
    <div class="example-row">
      <c-menu (select)="onTheme($event)">
        <c-button slot="trigger" text>
          <c-icon [path]="mdiThemeLightDark"></c-icon>
          Theme: {{ theme }}
          <c-icon [path]="mdiChevronDown"></c-icon>
        </c-button>

        <c-menu-label>Theme</c-menu-label>

        <c-menu-item
          *ngFor="let option of themes"
          [checked]="theme === option.value"
          [value]="option.value"
          type="radio"
        >
          <c-icon slot="icon" [path]="option.icon"></c-icon>
          {{ option.label }}
        </c-menu-item>
      </c-menu>
    </div>
  `,
})
export class RadioItemsExampleComponent {
  mdiChevronDown = mdiChevronDown;
  mdiThemeLightDark = mdiThemeLightDark;

  theme = 'dark';
  themes = [
    { icon: mdiWeatherNight, label: 'Dark', value: 'dark' },
    { icon: mdiWeatherSunny, label: 'Light', value: 'light' },
    { icon: mdiMonitor, label: 'System', value: 'system' },
  ];

  onTheme(event: Event) {
    this.theme = (event as CustomEvent<{ value: string }>).detail.value;
  }
}
