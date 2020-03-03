import { newE2EPage } from '@stencil/core/testing';

describe('csc-title', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<csc-title></csc-title>');

    const element = await page.find('csc-title');
    expect(element).toHaveClass('hydrated');
  });
});
