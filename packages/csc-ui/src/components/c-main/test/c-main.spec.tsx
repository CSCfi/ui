import { newSpecPage } from '@stencil/core/testing';
import { CMain } from '../c-main';

describe('c-main', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [CMain],
      html: `<c-main></c-main>`,
    });
    expect(page.root).toEqualHtml(`
      <c-main>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </c-main>
    `);
  });
});
