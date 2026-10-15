const { test, expect, open, scrollThrough, settle, axeSource } = require('./helpers');

const bg = (page) => page.evaluate(() => getComputedStyle(document.body).backgroundColor);

test('light theme: switch, persist, back to dark', async ({ page }) => {
  await open(page, '/index.html');
  const dark = await bg(page);
  await page.locator('#themeBtn').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(page.locator('#themeBtn')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#themeBtn')).toHaveText('Dark theme');
  await expect.poll(() => bg(page)).not.toBe(dark);
  expect(await page.evaluate(() => localStorage.getItem('theme'))).toBe('light');
  expect(await page.locator('meta[name=theme-color]').getAttribute('content')).toBe('#f4f1ea');
  await page.reload();
  await page.waitForFunction(() => window.KC);
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.locator('#themeBtn').click();
  await expect(page.locator('html')).not.toHaveAttribute('data-theme', 'light');
  expect(await page.evaluate(() => localStorage.getItem('theme'))).toBe('dark');
});

for (const [name, url] of [['English', '/index.html'], ['Arabic page', '/ar/']]) {
  test(`light theme, ${name}: no axe violations (contrast included)`, async ({ page }) => {
    await page.addInitScript(() => { try { localStorage.setItem('theme', 'light'); } catch (e) {} });
    await open(page, url);
    await page.evaluate(() => window.KC.load());
    await scrollThrough(page);
    await page.waitForTimeout(500);
    await settle(page);
    await page.evaluate(axeSource());
    const violations = await page.evaluate(async () => {
      const r = await axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'] });
      return r.violations.map((v) => `${v.id}: ${v.help} (${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join('; ')})`);
    });
    expect(violations).toEqual([]);
  });
}

test('light theme works with every accent and the tools still run', async ({ page }) => {
  await page.addInitScript(() => { try { localStorage.setItem('theme', 'light'); } catch (e) {} });
  await open(page, '/index.html');
  for (const a of ['gold', 'violet', 'sky', 'lime']) {
    await page.locator(`.accent-sw button[data-a=${a}]`).click();
    const ink = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--accent-ink').trim());
    expect(ink, a).toMatch(/^#[0-9a-f]{6}$/); // a dark ink colour, not the bright fill
  }
  await page.evaluate(() => window.KC.load());
  await page.keyboard.press('Control+k');
  await page.keyboard.type('theme');
  await expect(page.locator('#ckList li').first()).toContainText('theme');
});
