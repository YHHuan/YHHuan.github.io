import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const root = new URL("../", import.meta.url);
const requiredFiles = [
  "index.html",
  "styles.css",
  "content.js",
  "script.js",
  "assets/salmon-mark.svg",
  "404.html",
  "robots.txt",
  "sitemap.xml",
];

const files = Object.fromEntries(
  await Promise.all(
    requiredFiles.map(async (path) => [
      path,
      await readFile(new URL(path, root), "utf8"),
    ]),
  ),
);

const context = { window: {} };
vm.runInNewContext(files["content.js"], context);
const profile = context.window.PROFILE_CONTENT;

assert.ok(profile, "content.js must define PROFILE_CONTENT");
assert.match(profile.name, /\S+/, "profile name is required");
assert.ok(profile.researchThemes.length >= 3, "at least three research themes are required");
assert.ok(profile.projects.length >= 3, "at least three selected projects are required");
assert.ok(profile.methods.length >= 3, "at least three method areas are required");
assert.ok(profile.questions.length >= 3, "at least three current questions are required");

for (const project of profile.projects) {
  assert.match(project.href, /^https:\/\/github\.com\/YHHuan\//);
  assert.match(project.title, /\S+/);
  assert.match(project.description, /\S+/);
}

for (const anchor of ["research", "work", "approach", "contact"]) {
  assert.ok(files["index.html"].includes(`id="${anchor}"`), `missing #${anchor} section`);
  assert.ok(files["index.html"].includes(`href="#${anchor}"`), `missing #${anchor} nav link`);
}

assert.ok(!files["index.html"].includes("I-Hua Chen"), "template identity leaked into public page");
assert.ok(!files["content.js"].includes("I-Hua Chen"), "template identity leaked into content");
assert.ok(
  !files["index.html"].match(/google-analytics|googletagmanager|plausible|segment\.com/i),
  "analytics must be opt-in, not implicit",
);

console.log(`Validated ${requiredFiles.length} site files and ${profile.projects.length} projects.`);
