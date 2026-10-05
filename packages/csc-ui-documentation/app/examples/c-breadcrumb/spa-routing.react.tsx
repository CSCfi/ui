// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';
import type { MouseEvent } from 'react';
import { CBreadcrumb, CBreadcrumbItem } from '@cscfi/csc-ui-react';

const PAGES = [
  { name: 'Home', path: '/' },
  { name: 'Projects', path: '/projects' },
  { name: 'Project #1', path: '/projects/1' },
  { name: 'Members', path: '/projects/1/members' },
];

export const SpaRouting = () => {
  // Stands in for the router's current location.
  const [route, setRoute] = useState('/projects/1/members');

  const crumbs = PAGES.slice(
    0,
    PAGES.findIndex((page) => page.path === route) + 1,
  );

  const navigate = (event: MouseEvent, path: string) => {
    // Leave Ctrl-, Cmd- and Shift-clicks to the browser.
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) {
      return;
    }

    event.preventDefault();
    // In an app: navigate(path)
    setRoute(path);
  };

  return (
    <div>
      <CBreadcrumb>
        {crumbs.map((page) => (
          <CBreadcrumbItem
            key={page.path}
            href={page.path}
            onClick={(event) => navigate(event, page.path)}
          >
            {page.name}
          </CBreadcrumbItem>
        ))}
      </CBreadcrumb>

      <p>Route: {route}</p>
    </div>
  );
};
