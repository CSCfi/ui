import { newE2EPage } from '@stencil/core/testing';

describe('c-autocomplete', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<c-autocomplete></c-autocomplete>');

    const element = await page.find('c-autocomplete');
    expect(element).toHaveClass('hydrated');
  });
});
