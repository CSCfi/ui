import { newSpecPage } from '@stencil/core/testing';
import { CMenu } from '../c-menu';

describe('c-menu', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [CMenu],
      html: `<c-menu></c-menu>`,
    });
    expect(page.root).toEqualHtml(`
      <c-menu>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </c-menu>
    `);
  });
});
