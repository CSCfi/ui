// @ts-nocheck — documentation code sample; shown as text, never compiled here
import {
  Component,
  computed,
  CUSTOM_ELEMENTS_SCHEMA,
  signal,
} from '@angular/core';

const PAGES = [
  { name: 'Home', path: '/' },
  { name: 'Projects', path: '/projects' },
  { name: 'Project #1', path: '/projects/1' },
  { name: 'Members', path: '/projects/1/members' },
];

@Component({
  selector: 'app-example',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div>
      <c-breadcrumb>
        @for (page of crumbs(); track page.path) {
          <c-breadcrumb-item
            [href]="page.path"
            (click)="navigate($event, page.path)"
          >
            {{ page.name }}
          </c-breadcrumb-item>
        }
      </c-breadcrumb>

      <p>Route: {{ route() }}</p>
    </div>
  `,
})
export class SpaRoutingExampleComponent {
  // Stands in for the router's current URL.
  route = signal('/projects/1/members');

  crumbs = computed(() =>
    PAGES.slice(0, PAGES.findIndex((page) => page.path === this.route()) + 1),
  );

  navigate(event: MouseEvent, path: string) {
    // Leave Ctrl-, Cmd- and Shift-clicks to the browser.
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) {
      return;
    }

    event.preventDefault();
    // In an app: this.router.navigateByUrl(path)
    this.route.set(path);
  }
}
