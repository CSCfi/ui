import { newE2EPage } from '@stencil/core/testing';

describe('c-checkbox', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<c-checkbox></c-checkbox>');

    const element = await page.find('c-checkbox');
    expect(element).toHaveClass('hydrated');
  });
});
