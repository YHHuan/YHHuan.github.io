// Run with an existing Playwright installation; browser dependencies are not part of the site.
// PLAYWRIGHT_MODULE=/path/to/playwright/index.mjs node tests/browser.mjs
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
const modulePath = process.env.PLAYWRIGHT_MODULE;
const {chromium} = await import(modulePath ? pathToFileURL(modulePath).href : "playwright");
const base = process.env.BASE_URL || "http://127.0.0.1:4173";
const output = process.env.QA_DIR || "/tmp/yhh-profile-qa";
await mkdir(output, {recursive: true});
const browser = await chromium.launch({headless: true, ...(process.env.CHROMIUM_PATH ? {executablePath: process.env.CHROMIUM_PATH} : {})});
const files = ["index.html", "research.html", "publications.html", "conferences.html", "experience.html"];
const errors = [];
const report = [];
try {
  for (const width of [1440, 768, 390, 320]) {
    const context = await browser.newContext({viewport: {width, height: 960}, deviceScaleFactor: 1});
    // Font delivery is third-party and not a prerequisite for testing the static site.
    const page = await context.newPage();
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("response", (response) => {
      if (response.url().startsWith(base) && response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
    });
    for (const file of files) {
      await page.goto(`${base}/${file}`, {waitUntil: "networkidle"});
      assert.equal(await page.locator("h1").count(), 1);
      assert.equal(await page.locator('.site-nav a[aria-current="page"]').count(), 1);
      const metrics = await page.evaluate(() => ({width: innerWidth, scrollWidth: document.documentElement.scrollWidth, height: document.documentElement.scrollHeight}));
      assert.ok(metrics.scrollWidth <= width + 1, `${file} overflows at ${width}: ${metrics.scrollWidth}`);
      const broken = await page.locator("img").evaluateAll((imgs) => imgs.some((i) => !i.complete || i.naturalWidth === 0));
      assert.equal(broken, false, `${file}: broken image`);
      report.push({file, ...metrics});
      if ([1440,390].includes(width)) await page.screenshot({path: `${output}/${file}-${width}.png`, fullPage: true});
    }
    // Recreational qualifications stay understated, but work with a keyboard.
    assert.equal(await page.locator("#other-skills").getAttribute("open"), null);
    assert.equal(await page.locator(".extra-skills").isVisible(), false);
    await page.locator("#other-skills summary").focus();
    await page.keyboard.press("Enter");
    assert.equal(await page.locator(".extra-skills").isVisible(), true);
    assert.equal(await page.locator(".extra-skills dt").count(), 5);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    if ([1440,390].includes(width)) await page.locator("#other-skills").screenshot({path: `${output}/other-skills-open-${width}.png`});
    await page.keyboard.press("Enter");
    assert.equal(await page.locator(".extra-skills").isVisible(), false);
    await page.goto(`${base}/index.html`);
    const filmLink = page.locator(".personal-note").getByRole("link", {name: "Film notes · @shrimpy_thoughts"});
    assert.equal(await filmLink.getAttribute("href"), "https://www.instagram.com/shrimpy_thoughts/");
    assert.equal(await filmLink.getAttribute("rel"), "noopener noreferrer");
    await page.getByRole("link", {name: "More outside medicine"}).click();
    assert.ok(page.url().endsWith("experience.html#activities"));
    // Real links work without a hamburger or horizontal scrolling on narrow screens.
    await page.getByRole("navigation", {name: "Primary navigation", exact: true}).getByRole("link", {name: "Publications", exact: true}).click();
    assert.ok(page.url().endsWith("publications.html"));
    assert.equal(await page.locator(".publication:visible").count(), 5);
    await page.locator('[data-filter="preprints"]').click();
    assert.equal(await page.locator(".publication:visible").count(), 1);
    await page.locator('[data-filter="in-progress"]').click();
    assert.equal(await page.locator(".publication:visible").count(), 3);
    await page.locator('[data-filter="all"]').click();
    assert.equal(await page.locator(".publication:visible").count(), 9);
    await page.goBack();
    assert.equal(await page.locator(".publication:visible").count(), 3);
    await page.reload({waitUntil: "networkidle"});
    assert.equal(await page.locator(".publication:visible").count(), 3);
    await page.locator('[data-filter="published"]').focus();
    await page.keyboard.press("Enter");
    assert.equal(await page.locator(".publication:visible").count(), 5);
    await page.goto(`${base}/publications.html#dance-eeg`);
    assert.equal(await page.locator(".publication:visible").count(), 3);
    assert.ok(await page.locator("#dance-eeg").isVisible());
    await page.goto(`${base}/index.html#publications`);
    await page.waitForURL("**/publications.html");
    await page.goto(`${base}/index.html#approach`);
    await page.waitForURL("**/experience.html#skills");
    await page.goto(`${base}/research.html`);
    await page.locator("summary").first().focus();
    await page.keyboard.press("Enter");
    assert.equal(await page.locator("details[open]").count(), 1);
    await page.goto(`${base}/index.html`);
    await page.keyboard.press("Tab");
    assert.equal(await page.locator(":focus").textContent(), "Skip to content");
    await page.keyboard.press("Enter");
    assert.equal(await page.locator(":focus").getAttribute("id"), "main");
    await context.close();
  }
  const noJS = await browser.newContext({javaScriptEnabled: false});
  const page = await noJS.newPage();
  for (const file of files) {
    await page.goto(`${base}/${file}`);
    assert.equal(await page.locator("h1").count(), 1);
  }
  await page.goto(`${base}/publications.html`);
  assert.equal(await page.locator(".publication:visible").count(), 9);
  await page.getByRole("navigation", {name: "Primary navigation", exact: true}).getByRole("link", {name: "Research", exact: true}).click();
  assert.equal(await page.locator(".project").count(), 8);
  await page.goto(`${base}/experience.html#activities`);
  await page.locator("#other-skills summary").click();
  assert.equal(await page.locator(".extra-skills").isVisible(), true);
  await noJS.close();
  assert.deepEqual(errors, []);
  await writeFile(`${output}/report.json`, JSON.stringify({base, report, errors}, null, 2));
  console.log(`Passed 20 viewport/page checks, navigation, filtering, history, permalinks, keyboard, legacy links, and no-JS checks. Screenshots: ${output}`);
} finally {
  await browser.close();
}
