// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {
  mdiChevronDown,
  mdiMonitor,
  mdiRadioboxMarked,
  mdiThemeLightDark,
  mdiWeatherNight,
  mdiWeatherSunny,
} from '@mdi/js';

@Component({
  selector: 'app-example',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
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
          [active]="theme === 'dark'"
          [icon]="mdiWeatherNight"
          value="dark"
        >
          Dark
        </c-menu-item>
        <c-menu-item
          [active]="theme === 'light'"
          [icon]="mdiWeatherSunny"
          value="light"
        >
          Light
        </c-menu-item>
        <c-menu-item
          [active]="theme === 'system'"
          [icon]="mdiMonitor"
          value="system"
        >
          System
        </c-menu-item>
      </c-menu>

      <c-menu (select)="onSort($event)">
        <c-button slot="trigger" text>
          Sort by: {{ sortBy }}
          <c-icon [path]="mdiChevronDown"></c-icon>
        </c-button>

        <c-menu-item
          *ngFor="let key of sortKeys"
          [active]="sortBy === key"
          [activeIcon]="mdiRadioboxMarked"
          [value]="key"
        >
          {{ key }}
        </c-menu-item>
      </c-menu>
    </div>
  `,
})
export class ActiveItemsExampleComponent {
  mdiChevronDown = mdiChevronDown;
  mdiMonitor = mdiMonitor;
  mdiRadioboxMarked = mdiRadioboxMarked;
  mdiThemeLightDark = mdiThemeLightDark;
  mdiWeatherNight = mdiWeatherNight;
  mdiWeatherSunny = mdiWeatherSunny;

  theme = 'dark';
  sortKeys = ['name', 'size', 'date'];
  sortBy = 'name';

  onTheme(event: Event) {
    this.theme = (event as CustomEvent<{ value: string }>).detail.value;
  }

  onSort(event: Event) {
    this.sortBy = (event as CustomEvent<{ value: string }>).detail.value;
  }
}
