import { newSpecPage } from '@stencil/core/testing';
import { CConsent } from '../c-consent';

describe('c-consent', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [CConsent],
      html: `<c-consent></c-consent>`,
    });
    expect(page.root).toEqualHtml(`
      <c-consent>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </c-consent>
    `);
  });
});
