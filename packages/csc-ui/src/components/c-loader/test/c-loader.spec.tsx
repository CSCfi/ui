import { newSpecPage } from '@stencil/core/testing';
import { CLoader } from './c-loader';

describe('c-loader', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [CLoader],
      html: `<c-loader></c-loader>`,
    });
    expect(page.root).toEqualHtml(`
      <c-loader>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </c-loader>
    `);
  });
});
