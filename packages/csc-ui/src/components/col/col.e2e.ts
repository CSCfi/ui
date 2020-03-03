import { newE2EPage } from '@stencil/core/testing';

describe('csc-col', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<csc-col></csc-col>');

    const element = await page.find('csc-col');
    expect(element).toHaveClass('hydrated');
  });
});
