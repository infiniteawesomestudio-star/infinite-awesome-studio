#!/usr/bin/env python3
"""
Build crawlable Insights pages, a sitemap, robots.txt and JSON-LD for IAS.com.

WHY THIS EXISTS
---------------
Before this script, every article lived only inside blog-posts.json and was
injected into articles.html by JavaScript. Individual posts had no URL at all,
so there was nothing for Google, Bing, or an AI assistant's crawler to fetch,
index, or cite. Eight good articles were invisible.

This generates one real, server-rendered HTML page per published post, plus the
sitemap and robots.txt that tell crawlers those pages exist.

DESIGN NOTES
------------
* blog-posts.json stays the single source of truth. Nothing is authored here.
* The page shell (CSS, nav, footer) is EXTRACTED from landing/articles.html at
  build time rather than duplicated. Restyle articles.html and the post pages
  follow on the next build. There is no second design to maintain.
* Posts are written to landing/insights/<slug>.html, which Cloudflare Pages
  serves at /insights/<slug>. A separate directory is used deliberately:
  landing/articles.html already serves /articles, and adding a landing/articles/
  directory alongside it would make the routing for /articles ambiguous.
* Idempotent. Re-running overwrites generated files and re-injects JSON-LD
  between its markers. Safe to run on every deploy.

USAGE
    python3 tools/build-blog.py            # build
    python3 tools/build-blog.py --check    # verify up to date, write nothing
"""

import html
import json
import os
import re
import sys

SITE = "https://infiniteawesomestudio.com"
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
LANDING = os.path.join(ROOT, "landing")
POSTS_JSON = os.path.join(LANDING, "blog-posts.json")
ARTICLES_HTML = os.path.join(LANDING, "articles.html")
INSIGHTS_DIR = os.path.join(LANDING, "insights")

# Marker comments so JSON-LD injection is repeatable instead of additive.
LD_OPEN = "<!-- BEGIN generated JSON-LD (tools/build-blog.py) -->"
LD_CLOSE = "<!-- END generated JSON-LD -->"

# Pages that belong in the sitemap, with their crawl priority.
# Deliberately EXCLUDED:
#   /infinite-careers/  go-live is paused and the site is canned
#   /pantry/            not in the nav, not part of the business pitch
# Both are reachable but neither should be advertised to crawlers until Ty says so.
STATIC_PAGES = [
    ("/", "1.0"),
    ("/about", "0.9"),
    ("/articles", "0.9"),
    ("/products", "0.8"),
    ("/prompt-library", "0.8"),
    ("/benebots/", "0.7"),
    ("/infinity-desk/", "0.7"),
    ("/privacy-policy", "0.3"),
]


def esc(s):
    return html.escape(s or "", quote=True)


def load_posts():
    with open(POSTS_JSON, encoding="utf-8") as fh:
        data = json.load(fh)
    posts = [p for p in data["posts"] if p.get("status") == "published"]
    posts.sort(key=lambda p: p.get("date", ""), reverse=True)
    missing = [p.get("id") for p in posts if not p.get("slug")]
    if missing:
        raise SystemExit(f"posts missing a slug, cannot build URLs: {missing}")
    slugs = [p["slug"] for p in posts]
    dupes = {s for s in slugs if slugs.count(s) > 1}
    if dupes:
        raise SystemExit(f"duplicate slugs would collide as URLs: {sorted(dupes)}")
    return posts


def extract_shell():
    """Pull the CSS, nav and footer out of articles.html so posts match the site."""
    with open(ARTICLES_HTML, encoding="utf-8") as fh:
        src = fh.read()

    css = re.search(r"<style>(.*?)</style>", src, re.S)
    nav = re.search(r"(<!-- NAV -->.*?</div>\s*)(?=<main)", src, re.S)
    footer = re.search(r"(<footer class=\"ias-footer\">.*?</footer>)", src, re.S)
    navjs = re.search(r"(<script>\s*function toggleMobileNav.*?</script>)", src, re.S)
    for name, m in (("style", css), ("nav", nav), ("footer", footer), ("nav script", navjs)):
        if not m:
            raise SystemExit(f"could not find the {name} block in articles.html")

    # Post pages live one level deep, so relative asset paths must become absolute.
    nav_html = re.sub(r'(src|href)="(?!https?:|/|#|mailto:)', r'\1="/', nav.group(1))
    return css.group(1), nav_html, footer.group(1), navjs.group(1)


def post_ld(post, url, words):
    """BlogPosting schema. Sourced posts cite the reporting they respond to."""
    ld = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "@id": url + "#article",
        "url": url,
        "mainEntityOfPage": {"@type": "WebPage", "@id": url},
        "headline": post["title"],
        "description": post.get("excerpt", ""),
        "datePublished": post.get("date"),
        "dateModified": post.get("date"),
        "inLanguage": "en-US",
        "wordCount": words,
        "author": {
            "@type": "Person",
            "name": "Ty Mosher",
            "url": f"{SITE}/about",
        },
        "publisher": {
            "@type": "Organization",
            "name": "Infinite Awesome Studio",
            "url": SITE,
            "logo": {"@type": "ImageObject", "url": f"{SITE}/assets/ias-mark.png"},
        },
        "image": f"{SITE}/assets/og-image.jpg",
        "isAccessibleForFree": True,
    }
    if post.get("tags"):
        ld["keywords"] = ", ".join(post["tags"])
    if post.get("readMinutes"):
        ld["timeRequired"] = f"PT{int(post['readMinutes'])}M"
    # Honest attribution: these posts are Ty's commentary ON someone's reporting,
    # so the source is a citation, never the author.
    src = post.get("source")
    if src and src != "Original":
        ld["citation"] = src
        if post.get("sourceUrl"):
            ld["isBasedOn"] = post["sourceUrl"]
    return ld


def render_post(post, shell, prev_post, next_post):
    css, nav, footer, navjs = shell
    slug = post["slug"]
    url = f"{SITE}/insights/{slug}"
    title = post["title"]
    excerpt = post.get("excerpt", "")
    body = post.get("body", "")
    words = len(body.split())

    paras = "\n    ".join(
        f"<p>{esc(p.strip())}</p>" for p in body.split("\n\n") if p.strip()
    )

    tags = ""
    if post.get("tags"):
        chips = "".join(f'<span class="tag">{esc(t)}</span>' for t in post["tags"])
        tags = f'<div class="reader-tags">{chips}</div>'

    source = ""
    src_name = post.get("source")
    if src_name and src_name != "Original":
        if post.get("sourceUrl"):
            source = (
                f'<div class="source-note">This is my read on reporting from '
                f'{esc(src_name)}. <a href="{esc(post["sourceUrl"])}" target="_blank" '
                f'rel="noopener noreferrer nofollow">Read the original &rarr;</a></div>'
            )
        else:
            source = f'<div class="source-note">Source: {esc(src_name)}</div>'

    nearby = []
    if prev_post:
        nearby.append(
            f'<a href="/insights/{esc(prev_post["slug"])}">&larr; {esc(prev_post["title"])}</a>'
        )
    if next_post:
        nearby.append(
            f'<a href="/insights/{esc(next_post["slug"])}">{esc(next_post["title"])} &rarr;</a>'
        )
    more = ""
    if nearby:
        more = (
            '<nav class="source-note" aria-label="More insights">'
            + ' &nbsp;·&nbsp; '.join(nearby)
            + "</nav>"
        )

    ld = json.dumps(post_ld(post, url, words), indent=2, ensure_ascii=False)
    read = f' · {int(post["readMinutes"])} min read' if post.get("readMinutes") else ""
    label = esc(src_name or "Original")

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="icon" href="/favicon.ico" sizes="any" />
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
<title>{esc(title)} · Infinite Awesome Studio</title>
<meta name="description" content="{esc(excerpt)}">
<link rel="canonical" href="{url}" />

<!-- Open Graph / social share -->
<meta property="og:type" content="article" />
<meta property="og:site_name" content="Infinite Awesome Studio" />
<meta property="og:url" content="{url}" />
<meta property="og:title" content="{esc(title)}" />
<meta property="og:description" content="{esc(excerpt)}" />
<meta property="og:image" content="{SITE}/assets/og-image.jpg" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="Infinite Awesome Studio — a green infinity mark with an arrow rising out of it." />
<meta property="article:published_time" content="{esc(post.get('date',''))}" />
<meta property="article:author" content="Ty Mosher" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="{esc(title)}" />
<meta name="twitter:description" content="{esc(excerpt)}" />
<meta name="twitter:image" content="{SITE}/assets/og-image.jpg" />
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700&family=Source+Sans+3:wght@400;600;700&display=swap">

{LD_OPEN}
<script type="application/ld+json">
{ld}
</script>
{LD_CLOSE}
<style>{css}
/* Generated post pages render the reader immediately, with no JS gate. */
.reader{{display:block;}}
</style>
</head>
<body>
<a href="#main" class="ias-skip-link">Skip to main content</a>

{nav}
<main id="main" class="wrap">
  <article class="reader show">
    <a href="/articles" class="back-link">&larr; All insights</a>
    <div class="reader-meta"><span class="card-source">{label}</span><span>·</span><span>{esc(post.get('date',''))}</span><span>{read}</span></div>
    <h1>{esc(title)}</h1>
    <div class="reader-body">
    {paras}
    </div>
    {tags}
    {source}
    {more}
  </article>
</main>

{footer}

{navjs}
</body>
</html>
"""


def render_sitemap(posts):
    latest = max((p.get("date", "") for p in posts), default="")
    rows = []
    for path, priority in STATIC_PAGES:
        mod = f"\n    <lastmod>{latest}</lastmod>" if path in ("/", "/articles") and latest else ""
        rows.append(
            f"  <url>\n    <loc>{SITE}{path}</loc>{mod}\n"
            f"    <priority>{priority}</priority>\n  </url>"
        )
    for p in posts:
        rows.append(
            f"  <url>\n    <loc>{SITE}/insights/{p['slug']}</loc>\n"
            f"    <lastmod>{p.get('date','')}</lastmod>\n"
            f"    <priority>0.7</priority>\n  </url>"
        )
    body = "\n".join(rows)
    return (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        "<!-- Generated by tools/build-blog.py. Do not hand-edit. -->\n"
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        + body
        + "\n</urlset>\n"
    )


def render_robots():
    return (
        "# Generated by tools/build-blog.py. Do not hand-edit.\n"
        "User-agent: *\n"
        "Allow: /\n"
        "\n"
        f"Sitemap: {SITE}/sitemap.xml\n"
    )


def site_ld(posts):
    """Organization + Person + WebSite. This is what makes IAS a named entity."""
    org = {
        "@type": "Organization",
        "@id": f"{SITE}/#organization",
        "name": "Infinite Awesome Studio",
        "url": SITE,
        "logo": {"@type": "ImageObject", "url": f"{SITE}/assets/ias-mark.png"},
        "description": (
            "Infinite Awesome Studio gets teams actually using the AI licenses "
            "their company already pays for, on the work eating their week."
        ),
        "founder": {"@id": f"{SITE}/#ty"},
        "email": "ty@infiniteawesomestudio.com",
        "sameAs": [
            "https://www.linkedin.com/company/infiniteawesomestudio",
            "https://instagram.com/mybenefitsguy",
            "https://www.tiktok.com/@mybenefitsguy",
            "https://www.facebook.com/mybenefitsguy",
        ],
    }
    person = {
        "@type": "Person",
        "@id": f"{SITE}/#ty",
        "name": "Ty Mosher",
        "url": f"{SITE}/about",
        "jobTitle": "Founder",
        "worksFor": {"@id": f"{SITE}/#organization"},
        "description": (
            "Twenty-five years in employee benefits, now helping teams put the AI "
            "they already bought to work on the paperwork-heaviest work there is."
        ),
        "knowsAbout": [
            "AI adoption",
            "Employee benefits",
            "Benefits administration",
            "Human resources technology",
            "Workflow automation",
            "AI training for teams",
        ],
    }
    website = {
        "@type": "WebSite",
        "@id": f"{SITE}/#website",
        "url": SITE,
        "name": "Infinite Awesome Studio",
        "publisher": {"@id": f"{SITE}/#organization"},
        "inLanguage": "en-US",
    }
    return {"@context": "https://schema.org", "@graph": [org, person, website]}


def blog_ld(posts):
    return {
        "@context": "https://schema.org",
        "@type": "Blog",
        "@id": f"{SITE}/articles#blog",
        "url": f"{SITE}/articles",
        "name": "Insights · Infinite Awesome Studio",
        "description": (
            "Notes on AI and automation in the benefits and HR space, from a "
            "25-year benefits veteran building practical tools."
        ),
        "publisher": {"@id": f"{SITE}/#organization"},
        "inLanguage": "en-US",
        "blogPost": [
            {
                "@type": "BlogPosting",
                "@id": f"{SITE}/insights/{p['slug']}#article",
                "url": f"{SITE}/insights/{p['slug']}",
                "headline": p["title"],
                "datePublished": p.get("date"),
                "author": {"@id": f"{SITE}/#ty"},
            }
            for p in posts
        ],
    }


def inject_ld(path, payload):
    """Insert or replace the marked JSON-LD block just before </head>."""
    with open(path, encoding="utf-8") as fh:
        src = fh.read()
    block = (
        f"{LD_OPEN}\n<script type=\"application/ld+json\">\n"
        f"{json.dumps(payload, indent=2, ensure_ascii=False)}\n</script>\n{LD_CLOSE}\n"
    )
    pattern = re.compile(re.escape(LD_OPEN) + r".*?" + re.escape(LD_CLOSE) + r"\n?", re.S)
    if pattern.search(src):
        out = pattern.sub(block, src)
    else:
        if "</head>" not in src:
            raise SystemExit(f"no </head> in {path}, cannot inject schema")
        out = src.replace("</head>", block + "</head>", 1)
    return out, src


def main():
    check = "--check" in sys.argv
    posts = load_posts()
    shell = extract_shell()

    planned = {}

    os.makedirs(INSIGHTS_DIR, exist_ok=True)
    for i, post in enumerate(posts):
        prev_post = posts[i - 1] if i > 0 else None
        next_post = posts[i + 1] if i + 1 < len(posts) else None
        target = os.path.join(INSIGHTS_DIR, f"{post['slug']}.html")
        planned[target] = render_post(post, shell, prev_post, next_post)

    planned[os.path.join(LANDING, "sitemap.xml")] = render_sitemap(posts)
    planned[os.path.join(LANDING, "robots.txt")] = render_robots()

    for path, payload in (
        (os.path.join(LANDING, "index.html"), site_ld(posts)),
        (ARTICLES_HTML, blog_ld(posts)),
    ):
        out, _ = inject_ld(path, payload)
        planned[path] = out

    stale = []
    for path, content in planned.items():
        existing = None
        if os.path.exists(path):
            with open(path, encoding="utf-8") as fh:
                existing = fh.read()
        if existing != content:
            stale.append(path)

    if check:
        if stale:
            print("STALE, run tools/build-blog.py:")
            for p in sorted(stale):
                print("  ", os.path.relpath(p, ROOT))
            return 1
        print(f"up to date: {len(posts)} posts, {len(planned)} files")
        return 0

    for path, content in planned.items():
        with open(path, "w", encoding="utf-8") as fh:
            fh.write(content)

    print(f"built {len(posts)} post pages into landing/insights/")
    for p in posts:
        print(f"  /insights/{p['slug']}")
    print(f"wrote landing/sitemap.xml ({len(STATIC_PAGES) + len(posts)} URLs)")
    print("wrote landing/robots.txt")
    print("injected JSON-LD into landing/index.html and landing/articles.html")
    return 0


if __name__ == "__main__":
    sys.exit(main())
