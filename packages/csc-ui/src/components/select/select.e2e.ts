import { newE2EPage } from '@stencil/core/testing';

describe('c-select', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<c-select></c-select>');

    const element = await page.find('c-select');
    expect(element).toHaveClass('hydrated');
  });
});
