const { test, expect, open, scrollThrough, settle, axeSource } = require('./helpers');

for (const [name, url] of [['English', '/index.html'], ['Arabic page', '/ar/']]) {
  test(`${name}: no axe violations (WCAG 2.1 A/AA and best practice)`, async ({ page }) => {
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

test('interactive controls are at least 24px tall (sliders excepted)', async ({ page }) => {
  await open(page, '/index.html');
  await scrollThrough(page);
  const small = await page.evaluate(() => [...document.querySelectorAll('a[href],button,input:not([type=hidden]):not([type=range]),select,textarea,[tabindex="0"]')]
    .filter((x) => { const r = x.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(x).visibility !== 'hidden' && (r.width < 24 || r.height < 24); })
    .map((x) => (x.id || x.className || x.tagName) + ':' + Math.round(x.getBoundingClientRect().width) + 'x' + Math.round(x.getBoundingClientRect().height)));
  expect(small).toEqual([]);
});
