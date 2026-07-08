// @ts-nocheck — documentation code sample; shown as text, never compiled here
const styles = document.createElement('style');
styles.textContent = `
/* Demo-only sizing: c-main normally fills the whole viewport. */
.demo-shell::part(root) {
  height: 320px;
}

.demo-shell c-page {
  height: auto;
}
`;
document.head.append(styles);

// Typed via the HTMLElementTagNameMap augmentation from @cscfi/csc-ui-next.
const main = document.createElement('c-main');
main.className = 'demo-shell';

const toolbar = document.createElement('c-toolbar');
toolbar.className = 'relative';

const logo = document.createElement('c-csc-logo');

const title = document.createElement('span');
title.textContent = 'My Service';

toolbar.append(logo, title);

const page = document.createElement('c-page');

const heading = document.createElement('h2');
heading.textContent = 'Dashboard';

const paragraph = document.createElement('p');
paragraph.textContent = 'Page content goes here.';

page.append(heading, paragraph);
main.append(toolbar, page);
document.body.append(main);
