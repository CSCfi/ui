import { newE2EPage } from '@stencil/core/testing';

describe('c-h1', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<c-h1></c-h1>');

    const element = await page.find('c-h1');
    expect(element).toHaveClass('hydrated');
  });
});
