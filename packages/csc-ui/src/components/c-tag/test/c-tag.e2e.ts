import { newE2EPage } from '@stencil/core/testing';

describe('c-tag', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<c-tag></c-tag>');

    const element = await page.find('c-tag');
    expect(element).toHaveClass('hydrated');
  });
});
