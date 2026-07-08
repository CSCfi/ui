// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';

@Component({
  selector: 'app-example',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="example-row">
      <c-tags>
        @for (topic of topics(); track topic) {
          <c-tag closeable (close)="remove(topic)">
            {{ topic }}
          </c-tag>
        }
      </c-tags>
    </div>
  `,
})
export class CloseableExampleComponent {
  topics = signal(['Biosciences', 'Chemistry', 'Physics']);

  remove(topic: string) {
    this.topics.update((current) => current.filter((t) => t !== topic));
  }
}
