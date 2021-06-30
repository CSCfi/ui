import { newSpecPage } from '@stencil/core/testing';
import { CMenuItem } from '../c-menu-item';

describe('c-menu-item', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [CMenuItem],
      html: `<c-menu-item></c-menu-item>`,
    });
    expect(page.root).toEqualHtml(`
      <c-menu-item>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </c-menu-item>
    `);
  });
});
