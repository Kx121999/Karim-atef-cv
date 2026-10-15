const base = require('@playwright/test');
const fs = require('fs');
const path = require('path');

/** Every test fails on uncaught errors and console errors. Effects are on (lite mode off) and the intro is skipped. */
const test = base.test.extend({
  page: async ({ page }, use) => {
    const errors = [];
    page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
    page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
    await page.addInitScript(() => {
      try { localStorage.setItem('lite', '0'); sessionStorage.setItem('intro', '1'); } catch (e) {}
      window.__open = [];
      window.open = (u) => { window.__open.push(String(u)); return null; };
    });
    await use(page);
    base.expect(errors, 'no console or page errors').toEqual([]);
  },
});

/** Open a page and wait until the site script has started. */
async function open(page, url = '/index.html', lang) {
  if (lang) await page.addInitScript((l) => localStorage.setItem('lang', l), lang);
  await page.goto(url);
  await page.waitForFunction(() => window.KC && document.documentElement.classList.contains('ready'));
}

/** Scroll the whole page once so below-the-fold sections render and reveal. */
async function scrollThrough(page) {
  await page.evaluate(async () => {
    document.documentElement.style.scrollBehavior = 'auto';
    for (let y = 0; y < document.body.scrollHeight; y += 500) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 30)); }
    scrollTo(0, 0);
    document.documentElement.style.scrollBehavior = '';
  });
}

/** Jump to a section without smooth scrolling and let it render. */
async function jump(page, id) {
  await page.evaluate((i) => {
    document.documentElement.style.scrollBehavior = 'auto';
    const el = document.getElementById(i);
    scrollTo(0, el.getBoundingClientRect().top + scrollY);
  }, id);
  await page.waitForTimeout(300);
}

/** Wait for every finite animation and transition (reveals, fades) to finish, so axe measures final colours. */
async function settle(page) {
  await page.evaluate(() => {
    // only time-based animations: scroll-driven ones never "finish" while the page stands still
    const timed = document.getAnimations().filter((a) => a.timeline instanceof DocumentTimeline && a.effect && a.effect.getComputedTiming().iterations !== Infinity);
    return Promise.race([Promise.all(timed.map((a) => a.finished.catch(() => {}))), new Promise((r) => setTimeout(r, 5000))]);
  });
}

const axeSource = () => fs.readFileSync(path.join(__dirname, '..', 'node_modules', 'axe-core', 'axe.min.js'), 'utf8');

module.exports = { test, expect: base.expect, open, scrollThrough, jump, settle, axeSource };
