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
  "assets/yen-hsun-huang.webp",
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
assert.ok(profile.publications.length >= 5, "at least five publications are required");
assert.ok(profile.projects.length >= 4, "at least four selected projects are required");
assert.ok(profile.methods.length >= 3, "at least three method areas are required");
assert.ok(profile.presentations.length >= 3, "at least three presentations are required");
assert.ok(profile.questions.length >= 3, "at least three current questions are required");
assert.ok(
  profile.links.some(
    ({ href }) => href === "https://www.linkedin.com/in/yen-hsun-huang-4866a51bb/",
  ),
  "LinkedIn must be available from the hero",
);
assert.ok(
  files["index.html"].includes('src="assets/yen-hsun-huang.webp"'),
  "portrait must be rendered in the hero",
);

for (const project of profile.projects) {
  assert.match(project.title, /\S+/);
  assert.match(project.description, /\S+/);
  if (project.href?.includes("github.com")) {
    assert.match(project.href, /^https:\/\/github\.com\/YHHuan\//);
  }
}

for (const anchor of ["research", "publications", "work", "contact"]) {
  assert.ok(files["index.html"].includes(`id="${anchor}"`), `missing #${anchor} section`);
  assert.ok(files["index.html"].includes(`href="#${anchor}"`), `missing #${anchor} nav link`);
}

for (const leakedIdentity of ["I-Hua Chen", "Michael Y. H. Huang"]) {
  assert.ok(
    !files["index.html"].includes(leakedIdentity),
    `template identity leaked into public page: ${leakedIdentity}`,
  );
  assert.ok(
    !files["content.js"].includes(leakedIdentity),
    `template identity leaked into content: ${leakedIdentity}`,
  );
}
assert.ok(
  !files["index.html"].match(/google-analytics|googletagmanager|plausible|segment\.com/i),
  "analytics must be opt-in, not implicit",
);

console.log(`Validated ${requiredFiles.length} site files and ${profile.projects.length} projects.`);
