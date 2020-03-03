import { newE2EPage } from '@stencil/core/testing';

describe('csc-button', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<csc-button></csc-button>');

    const element = await page.find('csc-button');
    expect(element).toHaveClass('hydrated');
  });
});
