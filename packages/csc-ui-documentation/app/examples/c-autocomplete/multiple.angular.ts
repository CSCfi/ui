// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';
import {
  mdiLanguageGo,
  mdiLanguageJavascript,
  mdiLanguagePython,
  mdiLanguageRuby,
  mdiLanguageRust,
  mdiLanguageTypescript,
} from '@mdi/js';

@Component({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  selector: 'app-example',
  standalone: true,
  // Option content is copied into the panel: page classes do not reach it,
  // the `part` does.
  styles: `
    c-autocomplete::part(language) {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
    }
  `,
  template: `
    <div>
      <c-autocomplete
        [value]="languages()"
        clearable
        hint="Type to filter, pick several"
        label="Programming languages"
        max-tags="3"
        multiple
        placeholder="Start typing to search"
        (changeValue)="languages.set($any($event).detail)"
      >
        @for (option of options; track option.value) {
          <c-option [value]="option.value">
            <div part="language">
              <c-option-value>{{ option.label }}</c-option-value>
              <c-icon [color]="option.color" [path]="option.icon"></c-icon>
            </div>
          </c-option>
        }
      </c-autocomplete>

      <p>Value: {{ languages().length ? languages().join(', ') : '[]' }}</p>
    </div>
  `,
})
export class MultipleExampleComponent {
  languages = signal<string[]>(['ts']);

  options = [
    {
      color: '#F7DF1E',
      icon: mdiLanguageJavascript,
      label: 'JavaScript',
      value: 'js',
    },
    {
      color: '#3178C6',
      icon: mdiLanguageTypescript,
      label: 'TypeScript',
      value: 'ts',
    },
    {
      color: '#3776AB',
      icon: mdiLanguagePython,
      label: 'Python',
      value: 'py',
    },
    {
      color: '#CE422B',
      icon: mdiLanguageRust,
      label: 'Rust',
      value: 'rs',
    },
    {
      color: '#00ADD8',
      icon: mdiLanguageGo,
      label: 'Go',
      value: 'go',
    },
    {
      color: '#CC342D',
      icon: mdiLanguageRuby,
      label: 'Ruby',
      value: 'rb',
    },
  ];
}
