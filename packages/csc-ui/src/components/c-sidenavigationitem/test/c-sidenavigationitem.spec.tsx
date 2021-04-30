import { newSpecPage } from '@stencil/core/testing';
import { CSidenavigationitem } from '../c-sidenavigationitem';

describe('c-sidenavigationitem', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [CSidenavigationitem],
      html: `<c-sidenavigationitem></c-sidenavigationitem>`,
    });
    expect(page.root).toEqualHtml(`
      <c-sidenavigationitem>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </c-sidenavigationitem>
    `);
  });
});
