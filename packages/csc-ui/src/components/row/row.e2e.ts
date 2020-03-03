import { newE2EPage } from '@stencil/core/testing';

describe('csc-row', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<csc-row></csc-row>');

    const element = await page.find('csc-row');
    expect(element).toHaveClass('hydrated');
  });
});
