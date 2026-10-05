const PAGES = [
  { name: 'Home', path: '/' },
  { name: 'Projects', path: '/projects' },
  { name: 'Project #1', path: '/projects/1' },
  { name: 'Members', path: '/projects/1/members' },
];

// Stands in for the router's current location.
let route = '/projects/1/members';

const breadcrumb = document.querySelector('c-breadcrumb')!;

const render = () => {
  const crumbs = PAGES.slice(
    0,
    PAGES.findIndex((page) => page.path === route) + 1,
  );

  breadcrumb.replaceChildren(
    ...crumbs.map((page) => {
      const crumb = document.createElement('c-breadcrumb-item');

      crumb.href = page.path;
      crumb.textContent = page.name;

      return crumb;
    }),
  );
  document.querySelector('p')!.textContent = `Route: ${route}`;
};

// One listener for every crumb, folded ones included.
breadcrumb.addEventListener('click', (event) => {
  const crumb = (event.target as Element).closest('c-breadcrumb-item');

  // Leave Ctrl-, Cmd- and Shift-clicks to the browser.
  if (
    !crumb?.href ||
    event.ctrlKey ||
    event.metaKey ||
    event.shiftKey ||
    event.altKey
  ) {
    return;
  }

  event.preventDefault();
  // In an app: your router's navigate(crumb.href)
  route = crumb.href;
  render();
});

render();
