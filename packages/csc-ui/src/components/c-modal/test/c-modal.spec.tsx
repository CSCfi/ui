import { newSpecPage } from '@stencil/core/testing';
import { CModal } from '../c-modal';

describe('c-modal', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [CModal],
      html: `<c-modal></c-modal>`,
    });
    expect(page.root).toEqualHtml(`
      <c-modal>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </c-modal>
    `);
  });
});
