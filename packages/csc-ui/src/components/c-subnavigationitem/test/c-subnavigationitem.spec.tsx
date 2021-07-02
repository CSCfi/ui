import { newSpecPage } from '@stencil/core/testing';
import { CSubnavigationitem } from '../c-subnavigationitem';

describe('c-subnavigationitem', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [CSubnavigationitem],
      html: `<c-subnavigationitem></c-subnavigationitem>`,
    });
    expect(page.root).toEqualHtml(`
      <c-subnavigationitem>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </c-subnavigationitem>
    `);
  });
});
