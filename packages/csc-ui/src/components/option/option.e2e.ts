import { newE2EPage } from '@stencil/core/testing';

describe('c-option', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<c-option></c-option>');

    const element = await page.find('c-option');
    expect(element).toHaveClass('hydrated');
  });
});
