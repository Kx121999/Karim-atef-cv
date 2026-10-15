const { test, expect, axeSource } = require('./helpers');

const PAGES = ['campaign-costs.html', 'case-zaora.html', 'case-mosque.html'];
const BASE = 'https://kx121999.github.io/Karim-atef-cv/';

for (const slug of PAGES) {
  for (const [lang, url] of [['en', '/' + slug], ['ar', '/ar/' + slug]]) {
    test(`${url}: renders, images load, no horizontal scroll`, async ({ page }) => {
      await page.goto(url);
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('html')).toHaveAttribute('lang', lang);
      await expect(page.locator('html')).toHaveAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
      expect(await page.evaluate(() => [...document.images].every((i) => i.complete && i.naturalWidth > 0))).toBe(true);
      expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
    });

    test(`${url}: no axe violations`, async ({ page }) => {
      await page.goto(url);
      await page.evaluate(axeSource());
      const violations = await page.evaluate(async () => {
        const r = await axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'] });
        return r.violations.map((v) => `${v.id}: ${v.help} (${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join('; ')})`);
      });
      expect(violations).toEqual([]);
    });
  }

  test(`${slug}: canonical and hreflang point at each other`, async ({ page }) => {
    for (const [url, canonical] of [['/' + slug, BASE + slug], ['/ar/' + slug, BASE + 'ar/' + slug]]) {
      await page.goto(url);
      await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href', canonical);
      const alts = await page.$$eval('link[rel=alternate][hreflang]', (ls) => ls.map((l) => l.hreflang + '=' + l.href).sort());
      expect(alts).toEqual([`ar=${BASE}ar/${slug}`, `en=${BASE}${slug}`, `x-default=${BASE}${slug}`]);
    }
  });
}

test('Arabic article pages link to Arabic pages only', async ({ page }) => {
  for (const slug of PAGES) {
    await page.goto('/ar/' + slug);
    const hrefs = await page.$$eval('main a[href]', (as) => as.map((a) => { const u = new URL(a.href); return u.hostname === 'wa.me' ? 'wa.me' : u.pathname; }));
    for (const h of hrefs) expect(h, `${slug} -> ${h}`).toMatch(/\/ar\/|^wa\.me$/);
    expect(hrefs.some((h) => h.endsWith('/ar/'))).toBe(true);
  }
});

test('the case studies are numbers-only claims: figures match the portfolio cards', async ({ page }) => {
  await page.goto('/index.html');
  for (const [slug, id] of [['case-zaora.html', 'campaign-1.webp'], ['case-mosque.html', 'campaign-2.webp']]) {
    const card = await page.$eval(`.project-card[data-img="${id}"]`, (c) => [...c.querySelectorAll('.metrics b')].map((b) => b.textContent.trim()));
    await page.goto('/' + slug);
    const big = await page.$$eval('.big b', (bs) => bs.map((b) => b.textContent.trim()));
    expect(big).toEqual(card);
    await page.goto('/index.html');
  }
});

test('the lightbox links each case-study card to its page, in both languages', async ({ page }) => {
  await page.addInitScript(() => { try { localStorage.setItem('lite', '0'); sessionStorage.setItem('intro', '1'); } catch (e) {} });
  await page.goto('/index.html');
  await page.waitForFunction(() => window.KC);
  const link = async () => {
    await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; document.querySelector('.project-card[data-img="campaign-1.webp"]').scrollIntoView({ block: 'center' }); });
    await page.locator('.project-card[data-img="campaign-1.webp"]').click({ force: true });
    const href = await page.locator('#boxInfo a.foot-link').getAttribute('href');
    await page.keyboard.press('Escape');
    await expect(page.locator('#lightbox')).not.toBeVisible(); // fully closed before the next click
    return href;
  };
  expect(await link()).toBe('case-zaora.html');
  // the header hides while scrolled down, so switch language from the top of the page
  await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; scrollTo(0, 0); });
  await page.locator('#lang').click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
  await page.waitForTimeout(800); // the language cross-fade (view transition) swallows clicks while it runs
  expect(await link()).toBe('ar/case-zaora.html');
});

test('every page has its own share image, and the file exists', async ({ page, request }) => {
  const seen = new Set();
  for (const url of ['/index.html', '/ar/', ...PAGES.flatMap((s) => ['/' + s, '/ar/' + s])]) {
    await page.goto(url);
    const og = await page.locator('meta[property="og:image"]').getAttribute('content');
    const tw = await page.locator('meta[name="twitter:image"]').getAttribute('content');
    expect(tw, url).toBe(og);
    expect(og, url).toMatch(/\/og\/[a-z-]+\.jpg$/);
    seen.add(og);
    const res = await request.get(og.replace(BASE, '/'));
    expect(res.status(), og).toBe(200);
    expect(res.headers()['content-type'], og).toContain('image/jpeg');
  }
  expect(seen.size).toBe(8); // one image per page and language
});
