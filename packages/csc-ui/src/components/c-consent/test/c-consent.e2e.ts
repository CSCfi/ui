import { newE2EPage } from '@stencil/core/testing';

describe('c-consent', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<c-consent></c-consent>');

    const element = await page.find('c-consent');
    expect(element).toHaveClass('hydrated');
  });
});
