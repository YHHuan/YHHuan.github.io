# Research Profile

Static research profile for GitHub Pages.

## Edit content

All public profile copy, links, themes, and selected projects live in
[`content.js`](content.js). The HTML defines stable page structure; CSS defines the visual
system.

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
