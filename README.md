# Frame Collage Maker

A browser-based collage editor for building reusable photo layouts and exporting them as JPG or PNG images.

**Live site:** https://al-qassim.github.io/collage-maker/

## Features

- Split, resize, remove, and rearrange collage areas
- Spacing-aware geometry that keeps aligned grid cells equal
- Unlimited multi-page collages with independent page histories
- Current-page or all-page export
- Save projects to disk and reopen them later
- Bulk image import that generates enough layout areas for every image
- Automatic layout shuffling for existing images
- Divider snapping at common layout ratios
- Import, reposition, and zoom individual images
- Reusable built-in layouts, including an equal 3×3 grid, and user-saved layouts
- Independent horizontal and vertical page margins in centimeters
- Centimeter-based image spacing and corner radius at 300 DPI
- Optional always-visible frame measurements, with hover-only mode by default
- Exact frame dimensions in centimeters with direct width and height editing
- Configurable canvas sizes for screen and print
- JPG and PNG export, including transparent PNG backgrounds
- Per-page undo and redo, plus undoable page clearing
- Optional Google Analytics 4 visitor and feature-usage tracking
- Light and dark themes
- English and Arabic interfaces with RTL sidebar support
- Browser-local preferences and saved layouts

## Development

```bash
npm install
npm run dev
```

Then open the local URL printed by Vite.

## Validation

```bash
npm run typecheck
npm run build
```

## Architecture

- `src/models` — public domain models
- `src/data-service` — storage and image-export interfaces and browser implementations
- `src/ui/components` — colocated React components and CSS modules
- `src/ui/logic` — screen contracts, commands, reducers, interactions, and layout logic

## Analytics

Analytics are disabled unless a Google Analytics 4 measurement ID is configured.

1. Create a GA4 property and web data stream for `https://al-qassim.github.io/collage-maker/`.
2. In the GitHub repository, open **Settings → Secrets and variables → Actions**.
3. Add a repository secret named `VITE_GA_MEASUREMENT_ID` with a value such as `G-XXXXXXXXXX`.
4. Run the Pages deployment workflow again.

GA4 will collect page views and custom events for imports, exports, page creation, layout shuffling, project save/open, and canvas clearing. Review applicable consent and privacy requirements before enabling analytics.

For local analytics testing, copy `.env.example` to `.env` and add the measurement ID.

## Search indexing

The production build includes crawlable content, structured data, canonical/social metadata, a sitemap, and robots directives. Add the live URL to Google Search Console and submit:

`https://al-qassim.github.io/collage-maker/sitemap.xml`

## Deployment

Pushes to `main` are automatically built and deployed to GitHub Pages by the workflow in `.github/workflows/deploy-pages.yml`.
