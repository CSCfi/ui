import { newE2EPage } from '@stencil/core/testing';

describe('c-accordion', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<c-accordion></c-accordion>');

    const element = await page.find('c-accordion');
    expect(element).toHaveClass('hydrated');
  });
});
