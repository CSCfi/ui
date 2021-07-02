import { newSpecPage } from '@stencil/core/testing';
import { CPaginationrow } from '../c-paginationrow';

describe('c-paginationrow', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [CPaginationrow],
      html: `<c-paginationrow></c-paginationrow>`,
    });
    expect(page.root).toEqualHtml(`
      <c-paginationrow>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </c-paginationrow>
    `);
  });
});
