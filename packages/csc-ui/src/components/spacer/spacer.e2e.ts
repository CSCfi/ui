import { newE2EPage } from '@stencil/core/testing';

describe('csc-spacer', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<csc-spacer></csc-spacer>');

    const element = await page.find('csc-spacer');
    expect(element).toHaveClass('hydrated');
  });
});
