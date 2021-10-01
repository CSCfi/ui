import { newSpecPage } from '@stencil/core/testing';
import { CAccordion } from '../c-accordion';

describe('c-accordion', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [CAccordion],
      html: `<c-accordion></c-accordion>`,
    });
    expect(page.root).toEqualHtml(`
      <c-accordion>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </c-accordion>
    `);
  });
});
