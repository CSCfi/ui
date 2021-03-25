import { newE2EPage } from '@stencil/core/testing';

describe('c-notification', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<c-notification></c-notification>');

    const element = await page.find('c-notification');
    expect(element).toHaveClass('hydrated');
  });
});
