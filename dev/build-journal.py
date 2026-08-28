#!/usr/bin/env python3
"""Build the Historia Nomade Journal from one JSON source.

The public site is intentionally static. This script keeps the editorial
workflow simple while making the output SEO-friendly: article copy is present
in the HTML source, and the same source generates the archive, JS data for the
home page, RSS feed and sitemap.
"""

from __future__ import annotations

import argparse
import email.utils
import html
import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path
from xml.sax.saxutils import escape as xml_escape


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "content" / "journal.json"


def esc(value):
    return html.escape(str(value), quote=True)


def safe_json(value):
    return json.dumps(value, ensure_ascii=False, indent=2).replace("</", "<\\/")


def absolute_url(data, path):
    if path.startswith("http://") or path.startswith("https://"):
        return path
    return data["siteUrl"].rstrip("/") + "/" + path.lstrip("/")


def validate(data):
    required = ["siteUrl", "robots", "updatedAt", "siteName", "title", "description", "journal", "posts"]
    missing = [key for key in required if key not in data]
    if missing:
        raise ValueError("Missing top-level fields: " + ", ".join(missing))

    if not data["posts"]:
        raise ValueError("The Journal needs at least one post")

    slugs = set()
    slug_pattern = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
    for post in data["posts"]:
        for key in [
            "slug",
            "issue",
            "category",
            "title",
            "dek",
            "excerpt",
            "date",
            "datePublished",
            "dateModified",
            "readTime",
            "author",
            "image",
            "tags",
            "sections",
            "takeaways",
        ]:
            if key not in post:
                raise ValueError(f"Post {post.get('slug', '<unknown>')} is missing {key}")
        if not slug_pattern.fullmatch(post["slug"]):
            raise ValueError(f"Invalid slug: {post['slug']}")
        if post["slug"] in slugs:
            raise ValueError(f"Duplicate slug: {post['slug']}")
        slugs.add(post["slug"])
        for date_key in ["datePublished", "dateModified"]:
            datetime.strptime(post[date_key], "%Y-%m-%d")
        if not post["sections"] or any(
            not section.get("heading") or not section.get("paragraphs")
            for section in post["sections"]
        ):
            raise ValueError(f"Post {post['slug']} needs headings and paragraphs")


def header_html(prefix, home_href, journal_href):
    return f"""<header class="site-header">
  <div class="wrap header-inner">
    <a class="brand" href="{home_href}" aria-label="Historia Nomade — home">
      <img class="brand-mark" src="{prefix}assets/logo-mark.png" alt="" width="512" height="521" aria-hidden="true">
      <span class="brand-word">
        <img src="{prefix}assets/wordmark.svg" alt="Historia Nomade" width="360" height="42">
      </span>
    </a>
    <nav class="site-nav" aria-label="Main">
      <a href="{home_href}#services">Services</a>
      <a href="{home_href}#method">How we work</a>
      <a href="{journal_href}" aria-current="page">Journal</a>
      <a href="{home_href}#packages">Plans</a>
      <button class="theme-toggle" type="button" data-theme-toggle aria-pressed="false" aria-label="Switch theme" title="Switch theme">
        <svg class="icon-sun" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" aria-hidden="true">
          <circle cx="12" cy="12" r="4.2"></circle>
          <path d="M12 2.5v2.2M12 19.3v2.2M4.2 4.2l1.6 1.6M18.2 18.2l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.2 19.8l1.6-1.6M18.2 5.8l1.6-1.6"></path>
        </svg>
        <svg class="icon-moon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M20 14.2A8.2 8.2 0 0 1 9.8 4a8.4 8.4 0 1 0 10.2 10.2z"></path>
        </svg>
      </button>
      <a class="nav-cta" href="{home_href}#proposal">Get a proposal</a>
    </nav>
  </div>
</header>"""


def footer_html(data):
    year = esc(data["updatedAt"][:4])
    return f"""<footer class="site-footer">
  <div class="wrap">
    <p>Historia Nomade — brand, web, media and visibility for hospitality.</p>
    <p>No analytics, no cookies, no tracking. Your visit stays in your browser.</p>
    <p>© {year} Historia Nomade</p>
  </div>
</footer>"""


def page_head(data, *, title, description, canonical, og_type, prefix, feed_href, schema, post=None):
    image = absolute_url(data, (post or {}).get("image", data["ogImage"]))
    article_meta = ""
    if post:
        article_meta = f"""
<meta property="article:published_time" content="{esc(post['datePublished'])}">
<meta property="article:modified_time" content="{esc(post['dateModified'])}">
<meta property="article:section" content="{esc(post['category'])}">
<meta property="article:author" content="{esc(post['author'])}">"""

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="referrer" content="no-referrer">
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self'; font-src 'self'; img-src 'self' data:; connect-src 'none'; object-src 'none'; frame-src 'none'; worker-src 'none'; base-uri 'none'; form-action 'self'; upgrade-insecure-requests">

<!-- Change the single source value in content/journal.json when the site is ready for indexing. -->
<meta name="robots" content="{esc(data['robots'])}">

<title>{esc(title)}</title>
<meta name="description" content="{esc(description)}">
<link rel="canonical" href="{esc(canonical)}">
<link rel="alternate" type="application/rss+xml" title="Historia Nomade Journal" href="{feed_href}">

<meta property="og:type" content="{esc(og_type)}">
<meta property="og:title" content="{esc(title)}">
<meta property="og:description" content="{esc(description)}">
<meta property="og:url" content="{esc(canonical)}">
<meta property="og:image" content="{esc(image)}">
<meta property="og:image:alt" content="Historia Nomade Journal">
<meta property="og:locale" content="en">
{article_meta}
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{esc(title)}">
<meta name="twitter:description" content="{esc(description)}">
<meta name="twitter:image" content="{esc(image)}">

<meta name="theme-color" content="#14100c">
<link rel="icon" href="{prefix}assets/favicon.ico" sizes="any">
<link rel="icon" type="image/png" sizes="32x32" href="{prefix}assets/favicon-32.png">
<link rel="apple-touch-icon" sizes="180x180" href="{prefix}assets/favicon-180.png">
<link rel="stylesheet" href="{prefix}styles-base.css">
<link rel="stylesheet" href="{prefix}styles-site.css">
<link rel="stylesheet" href="{prefix}styles-journal.css">
<link rel="stylesheet" href="{prefix}styles-motion.css">
<script src="{prefix}js/theme.js"></script>

<script type="application/ld+json">
{safe_json(schema)}
</script>
</head>
<body>

<a class="skip-link" href="#main">Skip to content</a>
<div class="grain" aria-hidden="true"></div>
<div class="scroll-progress" aria-hidden="true"><span></span></div>
"""


def page_tail(prefix):
    return f"""
<script src="{prefix}js/motion.js"></script>
</body>
</html>
"""


def journal_card(post, href):
    accent = esc(post.get("accent", "terracotta"))
    return f"""<article class="journal-card journal-card--{accent}" data-reveal="scale">
  <div class="journal-card-cover">
    <span class="journal-card-issue">{esc(post['issue'])}</span>
    <span class="journal-card-category">{esc(post['category'])}</span>
  </div>
  <p class="journal-card-meta">{esc(post['date'])} · {esc(post['readTime'])}</p>
  <h3>{esc(post['title'])}</h3>
  <p class="journal-card-excerpt">{esc(post['excerpt'])}</p>
  <a class="journal-link" href="{href}">Read the note →</a>
</article>"""


def collection_schema(data):
    journal_url = absolute_url(data, "/journal/")
    items = []
    for position, post in enumerate(data["posts"], start=1):
        items.append(
            {
                "@type": "ListItem",
                "position": position,
                "name": post["title"],
                "url": absolute_url(data, "/journal/" + post["slug"] + "/"),
            }
        )
    return {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "Blog",
                "@id": journal_url + "#blog",
                "name": "Historia Nomade Journal",
                "url": journal_url,
                "description": data["description"],
                "publisher": {"@type": "Organization", "name": data["siteName"]},
            },
            {
                "@type": "CollectionPage",
                "@id": journal_url + "#page",
                "name": data["title"],
                "description": data["description"],
                "url": journal_url,
                "isPartOf": {"@id": journal_url + "#blog"},
                "mainEntity": {"@type": "ItemList", "itemListElement": items},
            },
        ],
    }


def article_schema(data, post):
    article_url = absolute_url(data, "/journal/" + post["slug"] + "/")
    journal_url = absolute_url(data, "/journal/")
    image = absolute_url(data, post["image"])
    article = {
        "@type": "BlogPosting",
        "@id": article_url + "#article",
        "headline": post["title"],
        "description": post["dek"],
        "image": [image],
        "datePublished": post["datePublished"],
        "dateModified": post["dateModified"],
        "author": {"@type": "Person", "name": post["author"]},
        "publisher": {"@type": "Organization", "name": data["siteName"]},
        "mainEntityOfPage": {"@type": "WebPage", "@id": article_url},
        "articleSection": post["category"],
        "keywords": post["tags"],
        "isPartOf": {"@id": journal_url + "#blog"},
    }
    breadcrumb = {
        "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": data["siteName"], "item": absolute_url(data, "/")},
            {"@type": "ListItem", "position": 2, "name": "Journal", "item": journal_url},
            {"@type": "ListItem", "position": 3, "name": post["title"], "item": article_url},
        ],
    }
    return {"@context": "https://schema.org", "@graph": [article, breadcrumb]}


def index_html(data):
    prefix = "../"
    journal_url = absolute_url(data, "/journal/")
    body = f"""<main id="main" class="journal-page">
  <section class="journal-hero" aria-labelledby="journal-page-title">
    <div class="wrap">
      <p class="eyebrow" data-reveal="">{esc(data['journal']['eyebrow'])}</p>
      <h1 id="journal-page-title" data-split="">{esc(data['journal']['title'])}</h1>
      <p class="lead" data-reveal="">{esc(data['journal']['lead'])}</p>
      <div class="journal-hero-meta" data-reveal="">
        {''.join(f'<span>{esc(item)}</span>' for item in data['journal']['archiveMeta'].split(' · '))}
      </div>
    </div>
  </section>

  <section class="journal-index-section" aria-labelledby="journal-archive-title">
    <div class="wrap">
      <div class="journal-index-heading">
        <h2 id="journal-archive-title">{esc(data['journal']['archiveLabel'])}</h2>
        <p>Read slowly. Take what is useful.</p>
      </div>
      <div class="journal-index-grid">
        {''.join(journal_card(post, post['slug'] + '/') for post in data['posts'])}
      </div>
    </div>
  </section>
</main>"""
    return (
        page_head(
            data,
            title=data["title"],
            description=data["description"],
            canonical=journal_url,
            og_type="website",
            prefix=prefix,
            feed_href="feed.xml",
            schema=collection_schema(data),
        )
        + header_html(prefix, "../", "./")
        + "\n"
        + body
        + "\n"
        + footer_html(data)
        + page_tail(prefix)
    )


def article_html(data, post):
    prefix = "../../"
    article_url = absolute_url(data, "/journal/" + post["slug"] + "/")
    sections = []
    for index, section in enumerate(post["sections"]):
        sections.append(f'<h2 data-split="">{esc(section["heading"])}</h2>')
        sections.extend(f"<p>{esc(paragraph)}</p>" for paragraph in section["paragraphs"])
        if index == 0 and post.get("pullQuote"):
            sections.append(
                f'<blockquote class="journal-pullquote" data-reveal="">{esc(post["pullQuote"])}</blockquote>'
            )

    takeaways = "".join(f"<li>{esc(item)}</li>" for item in post["takeaways"])
    rendered_sections = "\n          ".join(sections)
    body = f"""<main id="main" class="journal-page">
  <section class="journal-article-shell" aria-labelledby="article-title">
    <div class="wrap">
      <a class="journal-back" href="../" data-reveal="">← Back to the Journal</a>

      <header class="journal-article-header">
        <div class="journal-article-kicker" data-reveal="">
          <span>{esc(post['issue'])}</span>
          <span class="journal-kicker-rule"></span>
          <span>{esc(post['category'])}</span>
        </div>
        <h1 id="article-title" data-split="">{esc(post['title'])}</h1>
        <p class="journal-article-dek" data-reveal="">{esc(post['dek'])}</p>
        <p class="journal-article-meta" data-reveal="">{esc(post['date'])} · {esc(post['readTime'])} · Written by {esc(post['author'])}</p>
      </header>

      <div class="journal-article-layout">
        <article class="journal-body" aria-label="{esc(post['title'])}" data-reveal="">
          {rendered_sections}
        </article>

        <aside class="journal-article-rail">
          <div class="journal-route-card">
            <span class="route-issue">{esc(post['issue'])}</span>
            <h2>{esc(post['category'])}</h2>
            <p>A note from the road between a good place and a good first impression.</p>
          </div>
          <div class="journal-takeaways">
            <h2>Take it with you</h2>
            <ul>{takeaways}</ul>
          </div>
        </aside>
      </div>

      <aside class="journal-article-footer" data-reveal="">
        <h2>{esc(data['journal']['articleCtaTitle'])}</h2>
        <p>{esc(data['journal']['articleCtaLead'])}</p>
        <a class="btn btn-primary" href="../../#proposal">Tell us about your place →</a>
      </aside>
    </div>
  </section>
</main>"""
    return (
        page_head(
            data,
            title=post["title"] + " — Historia Nomade Journal",
            description=post["dek"],
            canonical=article_url,
            og_type="article",
            prefix=prefix,
            feed_href="../feed.xml",
            schema=article_schema(data, post),
            post=post,
        )
        + header_html(prefix, "../../", "../")
        + "\n"
        + body
        + "\n"
        + footer_html(data)
        + page_tail(prefix)
    )


def js_content(data):
    config = data["journal"]
    card_fields = ["slug", "issue", "category", "title", "excerpt", "date", "readTime", "accent"]
    posts = [{key: post[key] for key in card_fields} for post in data["posts"]]
    return """// Generated by dev/build-journal.py from content/journal.json.
const JOURNAL_CONFIG = %s;
const JOURNAL_POSTS = %s;

if (typeof module !== "undefined" && module.exports) {
  module.exports = { JOURNAL_CONFIG, JOURNAL_POSTS };
}
""" % (safe_json(config), safe_json(posts))


def feed_xml(data):
    site_url = data["siteUrl"].rstrip("/")
    updated = datetime.strptime(data["updatedAt"], "%Y-%m-%d").replace(tzinfo=timezone.utc)
    items = []
    for post in data["posts"]:
        post_url = site_url + "/journal/" + post["slug"] + "/"
        published = datetime.strptime(post["datePublished"], "%Y-%m-%d").replace(tzinfo=timezone.utc)
        items.append(
            f"""    <item>
      <title>{xml_escape(post['title'])}</title>
      <link>{xml_escape(post_url)}</link>
      <guid isPermaLink="true">{xml_escape(post_url)}</guid>
      <pubDate>{email.utils.format_datetime(published, usegmt=True)}</pubDate>
      <category>{xml_escape(post['category'])}</category>
      <description>{xml_escape(post['dek'])}</description>
    </item>"""
        )
    return f"""<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Historia Nomade Journal</title>
    <link>{xml_escape(site_url + '/journal/')}</link>
    <description>{xml_escape(data['description'])}</description>
    <language>en</language>
    <lastBuildDate>{email.utils.format_datetime(updated, usegmt=True)}</lastBuildDate>
    <atom:link href="{xml_escape(site_url + '/journal/feed.xml')}" rel="self" type="application/rss+xml" />
{chr(10).join(items)}
  </channel>
</rss>
"""


def sitemap_xml(data):
    site_url = data["siteUrl"].rstrip("/")
    rows = [
        (site_url + "/", data["updatedAt"], "monthly", "1.0"),
        (site_url + "/journal/", data["updatedAt"], "monthly", "0.8"),
    ]
    rows.extend(
        (
            site_url + "/journal/" + post["slug"] + "/",
            post["dateModified"],
            "yearly",
            "0.7",
        )
        for post in data["posts"]
    )
    entries = []
    for url, lastmod, changefreq, priority in rows:
        entries.append(
            f"""  <url>
    <loc>{xml_escape(url)}</loc>
    <lastmod>{xml_escape(lastmod)}</lastmod>
    <changefreq>{changefreq}</changefreq>
    <priority>{priority}</priority>
  </url>"""
        )
    return """<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
%s
</urlset>
""" % "\n".join(entries)


def expected_files(data):
    files = {
        "js/journal-content.js": js_content(data),
        "journal/index.html": index_html(data),
        "journal/feed.xml": feed_xml(data),
        "sitemap.xml": sitemap_xml(data),
    }
    for post in data["posts"]:
        files[f"journal/{post['slug']}/index.html"] = article_html(data, post)
    return files


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="verify generated files without writing")
    args = parser.parse_args()

    data = json.loads(SOURCE.read_text(encoding="utf-8"))
    validate(data)
    files = expected_files(data)
    mismatches = []

    for relative, content in files.items():
        path = ROOT / relative
        if args.check:
            if not path.exists() or path.read_text(encoding="utf-8") != content:
                mismatches.append(relative)
        else:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(content, encoding="utf-8")

    if args.check and mismatches:
        print("Generated files are out of date:")
        for relative in mismatches:
            print(" - " + relative)
        return 1

    if args.check:
        print(f"Journal build check: OK ({len(files)} generated files)")
    else:
        print(f"Journal built: {len(files)} generated files")
    return 0


if __name__ == "__main__":
    sys.exit(main())
