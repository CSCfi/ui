import { newE2EPage } from '@stencil/core/testing';

describe('c-menu-item', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<c-menu-item></c-menu-item>');

    const element = await page.find('c-menu-item');
    expect(element).toHaveClass('hydrated');
  });
});
