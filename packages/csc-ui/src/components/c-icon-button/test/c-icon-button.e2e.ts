import { newE2EPage } from '@stencil/core/testing';

describe('c-icon-button', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<c-icon-button></c-icon-button>');

    const element = await page.find('c-icon-button');
    expect(element).toHaveClass('hydrated');
  });
});
