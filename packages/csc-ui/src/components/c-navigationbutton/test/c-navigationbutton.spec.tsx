import { newSpecPage } from '@stencil/core/testing';
import { CNavigationbutton } from '../c-navigationbutton';

describe('c-navigationbutton', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [CNavigationbutton],
      html: `<c-navigationbutton></c-navigationbutton>`,
    });
    expect(page.root).toEqualHtml(`
      <c-navigationbutton>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </c-navigationbutton>
    `);
  });
});
