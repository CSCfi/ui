import { newSpecPage } from '@stencil/core/testing';
import { CH1 } from '../c-h1';

describe('c-h1', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [CH1],
      html: `<c-h1></c-h1>`,
    });
    expect(page.root).toEqualHtml(`
      <c-h1>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </c-h1>
    `);
  });
});
