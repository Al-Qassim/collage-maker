# SEO and Analytics Plan

## What is implemented

- Descriptive page title and search snippet description
- Canonical production URL
- Index/follow directives with expanded preview permissions
- Crawlable, useful HTML content that does not depend on JavaScript rendering
- One visible, descriptive H1 with supporting H2/H3 structure
- Natural coverage of collage maker, photo grid, picture layout, and image layout manager search intent
- `WebSite`, `WebApplication`, and visible `FAQPage` JSON-LD structured data
- Open Graph and Twitter card metadata with a 1200 × 630 preview image
- Sitemap, robots file, web manifest, and favicon
- Responsive content and accessible semantic controls
- Optional GA4 page-view and feature-usage tracking

## Required launch steps

### Google Search Console

1. Add `https://al-qassim.github.io/collage-maker/` to Google Search Console.
2. Complete the verification method supplied by Google.
3. Submit `https://al-qassim.github.io/collage-maker/sitemap.xml`.
4. Use URL Inspection to request indexing for the canonical page.
5. Monitor indexing, Core Web Vitals, search queries, impressions, and click-through rate.

A custom domain is strongly recommended. A short, memorable domain relevant to photo collages is easier to promote and gives the product an independent long-term identity.

### Google Analytics 4

1. Create a GA4 property and web stream for the production URL.
2. Add its measurement ID as the GitHub Actions repository secret `VITE_GA_MEASUREMENT_ID`.
3. Redeploy the site.
4. Confirm page views in GA4 Realtime.
5. Mark meaningful events as key events if they represent product success.

Tracked events:

- `images_imported`
- `images_exported`
- `page_added`
- `page_cleared`
- `layout_shuffled`
- `project_saved`
- `project_opened`

Analytics are disabled when no measurement ID is present. Before enabling GA4, review cookie consent, privacy disclosure, and regional legal requirements. A privacy-friendly cookieless platform can be substituted behind `AnalyticsService` if preferred.

## Ranking work outside the codebase

Technical SEO makes a page understandable and indexable, but it cannot guarantee a top position for competitive terms. Sustainable ranking also requires:

- Links and mentions from relevant design, photography, productivity, and open-source websites
- A custom domain with consistent branding
- Genuine user engagement and repeat usage
- Useful tutorials, examples, and original collage templates
- Continued performance and accessibility monitoring
- Search Console data used to improve titles and content around real queries
- Promotion through product directories, communities, and social previews

Do not create repetitive doorway pages, hide keywords, buy spam links, or repeat misspellings. Google commonly corrects “college maker” to “collage maker”; the page should target the accurate user intent rather than keyword-stuffing the typo.

## Research references

- [Google SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)
- [Google JavaScript SEO basics](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)
- [Google structured data introduction](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data)
- [Google spam policies](https://developers.google.com/search/docs/essentials/spam-policies)
- [Web Vitals](https://web.dev/articles/vitals)
