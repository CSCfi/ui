import { newE2EPage } from '@stencil/core/testing';

describe('csc-container', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<csc-container></csc-container>');

    const element = await page.find('csc-container');
    expect(element).toHaveClass('hydrated');
  });
});
