import { newSpecPage } from '@stencil/core/testing';
import { CCscLogo } from '../c-csc-logo';

describe('c-csc-logo', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [CCscLogo],
      html: `<c-csc-logo></c-csc-logo>`,
    });
    expect(page.root).toEqualHtml(`
      <c-csc-logo>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </c-csc-logo>
    `);
  });
});
