import { newE2EPage } from '@stencil/core/testing';

describe('c-text-field', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<c-text-field></c-text-field>');

    const element = await page.find('c-text-field');
    expect(element).toHaveClass('hydrated');
  });
});
