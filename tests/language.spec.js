const { test, expect, open } = require('./helpers');

test('language switch toggles in place and back', async ({ page }) => {
  await open(page, '/index.html');
  const title = page.locator('#services .section-title');
  await expect(title).toContainText(/connected creative system/i);
  await page.locator('#lang').click();
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(title).toContainText('منظومة إبداعية');
  await expect(page.locator('#lang')).toHaveText('EN');
  await page.locator('#lang').click();
  await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
  await expect(title).toContainText(/connected creative system/i);
});

test('saved Arabic is applied at load, placeholders included', async ({ page }) => {
  await open(page, '/index.html', 'ar');
  await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
  await expect(page.locator('#services .section-title')).toContainText('منظومة إبداعية');
  await expect(page.locator('input[name=name]')).toHaveAttribute('placeholder', 'اسمك');
});

test('the static Arabic page: no dictionary download, EN button goes to the English page', async ({ page }) => {
  const requested = [];
  page.on('request', (r) => requested.push(new URL(r.url()).pathname));
  await open(page, '/ar/');
  await expect(page.locator('#services .section-title')).toContainText('منظومة إبداعية');
  await expect(page.locator('#lang')).toHaveText('EN');
  expect(requested).not.toContain('/ar.js');
  await page.locator('#lang').click();
  await page.waitForURL(/\/(index\.html)?$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
});

test('hreflang alternates are consistent on both pages', async ({ page }) => {
  for (const url of ['/index.html', '/ar/']) {
    await page.goto(url);
    const alts = await page.$$eval('link[rel=alternate][hreflang]', (ls) => ls.map((l) => l.hreflang + '=' + l.href));
    expect(alts.sort()).toEqual([
      'ar=https://kx121999.github.io/Karim-atef-cv/ar/',
      'en=https://kx121999.github.io/Karim-atef-cv/',
      'x-default=https://kx121999.github.io/Karim-atef-cv/',
    ]);
  }
});
