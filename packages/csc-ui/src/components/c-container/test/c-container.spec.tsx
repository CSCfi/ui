import { newSpecPage } from '@stencil/core/testing';
import { CContainer } from './c-container';

describe('c-container', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [CContainer],
      html: `<c-container></c-container>`,
    });
    expect(page.root).toEqualHtml(`
      <c-container>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </c-container>
    `);
  });
});
