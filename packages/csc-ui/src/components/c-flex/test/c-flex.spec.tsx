import { newSpecPage } from '@stencil/core/testing';
import { CFlex } from '../c-flex';

describe('c-flex', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [CFlex],
      html: `<c-flex></c-flex>`,
    });
    expect(page.root).toEqualHtml(`
      <c-flex>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </c-flex>
    `);
  });
});
