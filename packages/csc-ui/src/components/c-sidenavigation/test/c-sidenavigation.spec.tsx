import { newSpecPage } from '@stencil/core/testing';
import { CSidenavigation } from '../c-sidenavigation';

describe('c-sidenavigation', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [CSidenavigation],
      html: `<c-sidenavigation></c-sidenavigation>`,
    });
    expect(page.root).toEqualHtml(`
      <c-sidenavigation>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </c-sidenavigation>
    `);
  });
});
