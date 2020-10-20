import { newSpecPage } from '@stencil/core/testing';
import { CCheckbox } from './c-checkbox';

describe('c-checkbox', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [CCheckbox],
      html: `<c-checkbox></c-checkbox>`,
    });
    expect(page.root).toEqualHtml(`
      <c-checkbox>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </c-checkbox>
    `);
  });
});
