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
  selector: 'app-example',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
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
              <c-icon [path]="option.icon"></c-icon>
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
    { value: 'js', label: 'JavaScript', icon: mdiLanguageJavascript },
    { value: 'ts', label: 'TypeScript', icon: mdiLanguageTypescript },
    { value: 'py', label: 'Python', icon: mdiLanguagePython },
    { value: 'rs', label: 'Rust', icon: mdiLanguageRust },
    { value: 'go', label: 'Go', icon: mdiLanguageGo },
    { value: 'rb', label: 'Ruby', icon: mdiLanguageRuby },
  ];
}
