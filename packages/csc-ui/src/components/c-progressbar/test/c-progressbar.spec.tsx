import { newSpecPage } from '@stencil/core/testing';
import { CProgressbar } from '../c-progressbar';

describe('c-progressbar', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [CProgressbar],
      html: `<c-progressbar></c-progressbar>`,
    });
    expect(page.root).toEqualHtml(`
      <c-progressbar>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </c-progressbar>
    `);
  });
});
