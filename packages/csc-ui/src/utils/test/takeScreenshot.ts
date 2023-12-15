import { Page, expect } from '@playwright/test';

export const takeScreenshots = async (
  page: Page,
  name: string,
  tag: string,
) => {
  const elements = page.locator(
    `[data-test="${name}"] [data-test-content] ${tag}`,
  );

  const count = await elements.count();

  for (let i = 0; i < count; i++) {
    const element = await elements.nth(i);
    await expect(element).toHaveScreenshot();
  }
};
