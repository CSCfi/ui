import { newE2EPage } from '@stencil/core/testing';

describe('c-subnavigationitem', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<c-subnavigationitem></c-subnavigationitem>');

    const element = await page.find('c-subnavigationitem');
    expect(element).toHaveClass('hydrated');
  });
});
