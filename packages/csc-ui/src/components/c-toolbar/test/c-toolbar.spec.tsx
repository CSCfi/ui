import { newSpecPage } from '@stencil/core/testing';
import { CToolbar } from '../c-toolbar';

describe('c-toolbar', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [CToolbar],
      html: `<c-toolbar></c-toolbar>`,
    });
    expect(page.root).toEqualHtml(`
      <c-toolbar>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </c-toolbar>
    `);
  });
});
