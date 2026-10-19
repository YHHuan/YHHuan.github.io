import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import vm from "node:vm";

const root = new URL("../", import.meta.url);
execFileSync(process.execPath, [new URL("scripts/build.mjs", root).pathname, "--check"], {stdio: "inherit"});
const pages = ["index.html", "research.html", "publications.html", "conferences.html", "experience.html"];
const html = Object.fromEntries(await Promise.all(pages.map(async (f) => [f, await readFile(new URL(f, root), "utf8")])));
const source = await readFile(new URL("content.js", root), "utf8");
const context = {window: {}};
vm.runInNewContext(source, context);
const c = context.window.PROFILE_CONTENT;
const sitemap = await readFile(new URL("sitemap.xml", root), "utf8");
const count = (str, pattern) => [...str.matchAll(pattern)].length;

assert.equal(c.publications.filter((p) => p.category === "published").length, 5);
assert.equal(c.publications.filter((p) => p.category === "preprints").length, 1);
assert.equal(c.publications.filter((p) => p.category === "in-progress").length, 3);
assert.equal(new Set(c.publications.map((p) => p.title)).size, c.publications.length);
assert.equal(new Set(c.publications.filter((p) => p.doi).map((p) => p.doi)).size, 6);
assert.match(c.role, /PGY-2/);
assert.match(c.nextStep, /Expected September 2027/);
assert.ok(!/PhD candidate|Ph\.D\.,|PGY-1|under review|Pulmonary Embolism/i.test(source));
assert.match(c.publications.find((p) => p.id === "dance-eeg").venue, /not yet submitted/);
assert.equal(c.publications.find((p) => p.id === "smart-glasses").doi, "10.3352/jeehp.2022.19.25");
assert.match(c.publications.find((p) => p.id === "lumen").authors, /Huang YH, Lin YS/);
assert.match(c.presentations.find((p) => p.venue === "ASPA 2026").authors, /Huang YH, Chiang IC, Hsu CH, Wong WL/);
assert.match(c.presentations.find((p) => p.venue === "ICOH 2027").note, /not yet presented/);
assert.ok(c.projects.some((p) => p.id === "firefighters" && p.methods.includes("CGM")));
assert.ok(c.awards.some((a) => a.organization.includes("NCMEA")));
assert.ok(c.activities.some((a) => a.organization.includes("popular music club")));

for (const file of pages) {
  const doc = html[file];
  assert.equal(count(doc, /<h1[\s>]/g), 1, `${file}: one h1`);
  assert.equal(count(doc, /aria-current="page"/g), 1, `${file}: one current nav item`);
  assert.ok(doc.includes(`href="${file}" aria-current="page"`));
  assert.match(doc, /<main id="main" tabindex="-1">/);
  assert.match(doc, /<link rel="canonical"/);
  assert.match(doc, /<meta name="description" content="[^"\n]+">/);
  assert.match(doc, /<html lang="en">/);
  assert.equal(count(doc, /<nav class="site-nav"/g), 1);
  const ids = [...doc.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]);
  assert.equal(new Set(ids).size, ids.length, `${file}: unique IDs`);
  for (const target of pages) assert.ok(doc.includes(`href="${target}"`), `${file} links to ${target}`);
  assert.ok(sitemap.includes(`https://yhhuan.github.io/${file === "index.html" ? "" : file}`));
  for (const m of doc.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const url = m[1];
    if (url.startsWith("https:")) continue;
    assert.ok(!/^(javascript:|data:|file:|http:)/.test(url), `unsafe URL ${url}`);
    const [path, fragment] = url.split("#");
    if (path) await access(new URL(path, root));
    if (fragment) {
      assert.ok((html[path || file] || "").includes(`id="${fragment}"`), `broken fragment ${file}: ${url}`);
    }
  }
  for (const m of doc.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)) assert.match(m[0], /rel="noopener noreferrer"/);
  assert.ok(!/google-analytics|googletagmanager|plausible|segment\.com|mailto:|tel:|\b09[0-9]{8}\b|在訓證明|推薦信|學年度|碩士班甄試/.test(doc), `${file}: privacy or stale application copy`);
}
assert.ok(!html["index.html"].includes('class="publication"'), "Home should not repeat the full bibliography");
assert.ok(html["index.html"].includes('src="assets/yen-hsun-huang-avatar.webp"'));
assert.equal(count(html["publications.html"], /class="publication"/g), 9, "Content must exist without JS");
assert.equal(count(html["research.html"], /<details>/g), c.projects.length);
assert.equal(count(html["conferences.html"], /class="conference"/g), c.presentations.length);
console.log(`Validated ${pages.length} pages, ${c.publications.length} publication records, ${c.projects.length} projects, links, status and privacy checks.`);
