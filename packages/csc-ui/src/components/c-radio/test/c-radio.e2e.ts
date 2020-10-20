import { newE2EPage } from '@stencil/core/testing';

describe('c-radio', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<c-radio></c-radio>');

    const element = await page.find('c-radio');
    expect(element).toHaveClass('hydrated');
  });
});
