import { newSpecPage } from '@stencil/core/testing';
import { CNotification } from '../c-notification';

describe('c-notification', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [CNotification],
      html: `<c-notification></c-notification>`,
    });
    expect(page.root).toEqualHtml(`
      <c-notification>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </c-notification>
    `);
  });
});
