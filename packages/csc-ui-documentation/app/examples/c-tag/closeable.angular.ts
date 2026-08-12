// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';

interface Topic {
  id: string;
  label: string;
  active: boolean;
}

const createTopics = (): Topic[] => [
  { id: 'biosciences', label: 'Biosciences', active: false },
  { id: 'chemistry', label: 'Chemistry', active: false },
  { id: 'physics', label: 'Physics', active: false },
];

@Component({
  selector: 'app-example',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="example-grid">
      <c-tags>
        @for (topic of topics(); track topic.id) {
          <c-tag
            [active]="topic.active"
            closeable
            (click)="toggle(topic.id)"
            (close)="remove(topic.id)"
          >
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

  toggle(id: string) {
    this.topics.update((current) =>
      current.map((topic) =>
        topic.id === id ? { ...topic, active: !topic.active } : topic,
      ),
    );
  }

  remove(id: string) {
    this.topics.update((current) => current.filter((topic) => topic.id !== id));
  }

  reset() {
    this.topics.set(createTopics());
  }
}
