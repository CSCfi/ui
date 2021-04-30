import { newE2EPage } from '@stencil/core/testing';

describe('c-toolbar', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<c-toolbar></c-toolbar>');

    const element = await page.find('c-toolbar');
    expect(element).toHaveClass('hydrated');
  });
});
