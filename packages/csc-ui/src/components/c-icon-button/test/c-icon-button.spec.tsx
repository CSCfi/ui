import { newSpecPage } from '@stencil/core/testing';
import { CIconButton } from '../c-icon-button';

describe('c-icon-button', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [CIconButton],
      html: `<c-icon-button></c-icon-button>`,
    });
    expect(page.root).toEqualHtml(`
      <c-icon-button>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </c-icon-button>
    `);
  });
});
