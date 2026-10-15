# Tests

Browser tests for the site, run on every pull request by `.github/workflows/test.yml`.

```
npm install
npx playwright install chromium     # once
npm test                            # desktop (1400px) and mobile (390px) projects
npx playwright test --project=mobile tests/tools.spec.js
python3 tools/build-ar.py --check   # ar/index.html must match index.html + ar.js
```

If Chromium is installed somewhere else, set `CHROMIUM_PATH=/path/to/chromium`.

| File | Covers |
| --- | --- |
| `smoke.spec.js` | every section, no horizontal scroll, titles/canonical, fonts, service worker |
| `language.spec.js` | in-place EN/AR switch, saved Arabic, the static `/ar/` page, hreflang |
| `navigation.spec.js` | far anchor jumps land on the section, `#hash` URLs, nav links, skip link |
| `contact.spec.js` | campaign filter, contact form to WhatsApp |
| `tools.spec.js` | Ad Audit, Campaign Plan, Request a Call, estimator share, Poster Lab, Reel Hooks, search palette (also in Arabic) |
| `lightbox.spec.js` | preview open/cycle/close/focus return, Tab trap, 3D reel ring |
| `a11y.spec.js` | axe-core WCAG 2.1 A/AA + best practice on `/` and `/ar/`, tap-target size |

Every test also fails on any console error or uncaught exception.
Headless Chromium has no H.264, so videos are never played; tests only check what opens.

`articles.spec.js` covers the article pages (`campaign-costs.html`, `case-zaora.html`, `case-mosque.html`) and their Arabic copies under `ar/`: render, images, axe, canonical/hreflang, links stay in Arabic, figures match the portfolio cards, and the lightbox link to each case study.
