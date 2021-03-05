import { newE2EPage } from '@stencil/core/testing';

describe('c-progressbar', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<c-progressbar></c-progressbar>');

    const element = await page.find('c-progressbar');
    expect(element).toHaveClass('hydrated');
  });
});
