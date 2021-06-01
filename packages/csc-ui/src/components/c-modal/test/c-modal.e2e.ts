import { newE2EPage } from '@stencil/core/testing';

describe('c-modal', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<c-modal></c-modal>');

    const element = await page.find('c-modal');
    expect(element).toHaveClass('hydrated');
  });
});
