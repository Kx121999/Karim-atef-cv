const { test, expect, open } = require('./helpers');

const IDS = ['services', 'experience', 'campaigns', 'planner', 'hooks', 'videos', 'about', 'book', 'contact'];

for (const url of ['/index.html', '/ar/']) {
  test(`${url}: far jumps land on the section (sections below the fold are not laid out until needed)`, async ({ page }) => {
    await open(page, url);
    for (const id of IDS) {
      await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; scrollTo(0, 0); });
      await page.evaluate((i) => window.KC.goTo(document.getElementById(i)), id);
      await expect.poll(() => page.evaluate((i) => Math.abs(Math.round(document.getElementById(i).getBoundingClientRect().top)), id), { timeout: 6000, message: id }).toBeLessThanOrEqual(3);
    }
  });
}

test('nav links update the address and land on the section', async ({ page }) => {
  await open(page, '/ar/');
  await page.evaluate(() => [...document.querySelectorAll('a[href="ar/#campaigns"]')].find((a) => a.offsetParent).click());
  await expect.poll(() => page.evaluate(() => Math.abs(Math.round(document.getElementById('campaigns').getBoundingClientRect().top)))).toBeLessThanOrEqual(3);
  expect(new URL(page.url()).pathname + new URL(page.url()).hash).toBe('/ar/#campaigns');
});

test('opening a #hash URL lands on the section', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('lite', '0'));
  await page.goto('/index.html#planner');
  await expect.poll(() => page.evaluate(() => Math.abs(Math.round(document.getElementById('planner').getBoundingClientRect().top))), { timeout: 8000 }).toBeLessThanOrEqual(3);
});

test('skip link moves focus to main', async ({ page }) => {
  await open(page, '/index.html');
  await page.keyboard.press('Tab');
  await expect(page.locator('.skip')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#main')).toBeFocused();
});
