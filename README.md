# Research Profile

Static, multi-page academic profile for GitHub Pages. The original paper/forest/salmon
palette, Newsreader/DM Sans typography, portrait, and public identity are retained.

## Pages

- `index.html`: short introduction, expected next step, and category links
- `research.html`: projects and expandable contribution details
- `publications.html`: peer-reviewed papers, preprints, and unfinished manuscripts
- `conferences.html`: posters, accepted abstracts, and teaching
- `experience.html`: education, experience, awards, student activities, and skills

Every page contains its content as static HTML. JavaScript only enhances publication
filters and redirects bookmarks from the old single-page website. Content and navigation
remain available without JavaScript; filters support shareable hashes and browser history.

## Edit content

All public profile copy, links, projects, citations, and experience live in
[`content.js`](content.js). Page templates live in [`scripts/build.mjs`](scripts/build.mjs);
[`styles.css`](styles.css) defines the visual system. Do not edit generated HTML directly.

After changing content or templates, regenerate and validate locally with Node.js:

```bash
node scripts/build.mjs
node tests/validate.mjs
```

Commit the edited source and generated HTML/sitemap together. GitHub Pages serves those
files directly from `main`; no server, dependency installation, or Pages build configuration
change is needed. Updating only `content.js` in the GitHub editor will not update the pages.

Common edit locations in `content.js`:

- `publications`: papers and preprints
- `projects`: active and selected research
- `presentations`: posters, talks, and workshops
- `education`, `experience`, `awards`, `activities`: training and background
- `methods`: technical skills and research interests
- `links`: public profile links

Keep the surrounding commas, quotation marks, and braces intact. Update `updated` when
reconciling content. Keep manuscript categories accurate; future education must remain
explicitly marked as expected until enrollment is confirmed.

The public portrait is `assets/yen-hsun-huang-avatar.webp`. Replace it with a square WebP using
the same filename to update it without changing HTML. Strip EXIF metadata before publishing;
the original phone photo should not be uploaded because it may contain location data.

Before adding a publication, presentation, degree, institutional affiliation, or contact address,
verify the exact public wording and source. Do not upload application PDFs, certificates,
recommendation letters, private addresses, phone numbers, or raw research data. This site
links to publication sources instead of redistributing article PDFs.

## Preview

```bash
python3 -m http.server 4173
```

Open `http://127.0.0.1:4173`.

## Validate

```bash
node tests/validate.mjs
node --check script.js
node --check content.js
```

The validation script checks generated-file freshness, citation categories, navigation,
local links, metadata, and privacy/stale-status regressions.

Optional browser QA (with an existing Playwright installation and browser):

```bash
PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs \
CHROMIUM_PATH=/absolute/path/to/chrome \
node tests/browser.mjs
```

`BASE_URL` defaults to `http://127.0.0.1:4173`; `QA_DIR` defaults to `/tmp/yhh-profile-qa`.
Checks cover five pages at four widths, no horizontal overflow, working navigation,
publication filters/history/permalinks, old bookmarks, keyboard operation, and no-JS access.
Screenshots and reports are written outside the repository.

The site has no analytics, accounts, or runtime build dependencies. GitHub Pages serves
the repository root from the `main` branch.
