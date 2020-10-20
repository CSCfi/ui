import { newSpecPage } from '@stencil/core/testing';
import { CRadio } from './c-radio';

describe('c-radio', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [CRadio],
      html: `<c-radio></c-radio>`,
    });
    expect(page.root).toEqualHtml(`
      <c-radio>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </c-radio>
    `);
  });
});
