import { newE2EPage } from '@stencil/core/testing';

describe('c-navigationbutton', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<c-navigationbutton></c-navigationbutton>');

    const element = await page.find('c-navigationbutton');
    expect(element).toHaveClass('hydrated');
  });
});
