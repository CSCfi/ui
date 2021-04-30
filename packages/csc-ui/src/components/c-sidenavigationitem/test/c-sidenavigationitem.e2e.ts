import { newE2EPage } from '@stencil/core/testing';

describe('c-sidenavigationitem', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<c-sidenavigationitem></c-sidenavigationitem>');

    const element = await page.find('c-sidenavigationitem');
    expect(element).toHaveClass('hydrated');
  });
});
