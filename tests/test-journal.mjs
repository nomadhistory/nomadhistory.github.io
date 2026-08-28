import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourcePath = path.join(root, "content", "journal.json");
const source = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
const archive = fs.readFileSync(path.join(root, "journal", "index.html"), "utf8");
const feed = fs.readFileSync(path.join(root, "journal", "feed.xml"), "utf8");
const sitemap = fs.readFileSync(path.join(root, "sitemap.xml"), "utf8");

assert.match(archive, /CollectionPage/);
assert.match(archive, /application\/rss\+xml/);
assert.match(archive, /noindex, nofollow/);

for (const post of source.posts) {
  const url = `/journal/${post.slug}/`;
  const articlePath = path.join(root, "journal", post.slug, "index.html");
  assert.ok(fs.existsSync(articlePath), `article exists: ${post.slug}`);

  const article = fs.readFileSync(articlePath, "utf8");
  assert.match(article, /<article class="journal-body"/);
  assert.match(article, /BlogPosting/);
  assert.match(article, /BreadcrumbList/);
  assert.match(article, /noindex, nofollow/);
  assert.match(article, new RegExp(post.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.match(article, new RegExp(post.sections[0].heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.match(article, new RegExp(`<link rel="canonical" href="https://nomadhistory\\.github\\.io${url}"`));
  assert.match(feed, new RegExp(url.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.match(sitemap, new RegExp(url.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
}

console.log(`${source.posts.length} journal article(s) passed static SEO checks.`);
