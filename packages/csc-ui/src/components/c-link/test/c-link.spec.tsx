import { newSpecPage } from '@stencil/core/testing';
import { CLink } from '../c-link';

describe('c-link', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [CLink],
      html: `<c-link></c-link>`,
    });
    expect(page.root).toEqualHtml(`
      <c-link>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </c-link>
    `);
  });
});
