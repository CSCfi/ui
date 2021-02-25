import { newSpecPage } from '@stencil/core/testing';
import { CTag } from '../c-tag';

describe('c-tag', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [CTag],
      html: `<c-tag></c-tag>`,
    });
    expect(page.root).toEqualHtml(`
      <c-tag>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </c-tag>
    `);
  });
});
