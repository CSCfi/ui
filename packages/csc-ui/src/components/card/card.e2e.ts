import { newE2EPage } from '@stencil/core/testing';

describe('csc-card', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<csc-card></csc-card>');

    const element = await page.find('csc-card');
    expect(element).toHaveClass('hydrated');
  });
});
