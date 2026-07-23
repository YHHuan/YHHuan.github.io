# Research Profile

Static research profile for GitHub Pages.

## Edit content

All public profile copy, links, themes, and selected projects live in
[`content.js`](content.js). The HTML defines stable page structure; CSS defines the visual
system.

For ordinary text updates, open
[`content.js` in the GitHub editor](https://github.com/YHHuan/YHHuan.github.io/edit/main/content.js),
use the pencil editor, and commit the change to `main`. GitHub Pages deploys it automatically;
there is no build command to run.

Common edit locations in `content.js`:

- `publications`: papers and preprints
- `projects`: active and selected research
- `presentations`: posters, talks, workshops, and recognition
- `methods`: technical skills and research interests
- `links` and `contactLinks`: public profile links

Keep the surrounding commas, quotation marks, and braces intact. For layout changes, edit
`styles.css`; for page structure, edit `index.html`.

The public portrait is `assets/yen-hsun-huang-avatar.webp`. Replace it with a square WebP using
the same filename to update it without changing HTML. Strip EXIF metadata before publishing;
the original phone photo should not be uploaded because it may contain location data.

Before adding a publication, presentation, degree, institutional affiliation, or contact address,
verify the exact public wording and source. The current draft intentionally avoids unverified
bibliographic claims.

## Preview

```bash
python3 -m http.server 4173
```

Open `http://127.0.0.1:4173`.

## Validate

```bash
node tests/validate.mjs
```

The site has no build step and no analytics. GitHub Pages serves the repository root from the
`main` branch.
