import { newE2EPage } from '@stencil/core/testing';

describe('c-accordion', () => {
  it('should do SOMETHING!', async () => {
    const page = await newE2EPage();
    await page.setContent(
      `<c-accordion><c-accordion-item>Lorem ipsum dolor sit amet.</c-accordion-item></c-accordion>`,
    );
    await page.waitForChanges();

    const listElement = await page.find('c-accordion');

    await page.waitForChanges();

    expect(listElement).toMatchSnapshot('JHORMA');
  });
});
