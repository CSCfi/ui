// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';

interface Topic {
  id: string;
  label: string;
}

const createTopics = (): Topic[] => [
  { id: 'biosciences', label: 'Biosciences' },
  { id: 'chemistry', label: 'Chemistry' },
  { id: 'physics', label: 'Physics' },
];

@Component({
  selector: 'app-example',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="example-grid">
      <c-tags>
        @for (topic of topics(); track topic.id) {
          <c-tag closeable (close)="remove(topic.id)">
            {{ topic.label }}
          </c-tag>
        }
      </c-tags>

      <div>
        <c-button (click)="reset()">Reset topics</c-button>
      </div>
    </div>
  `,
})
export class CloseableExampleComponent {
  topics = signal(createTopics());

  remove(id: string) {
    this.topics.update((current) => current.filter((topic) => topic.id !== id));
  }

  reset() {
    this.topics.set(createTopics());
  }
}
