# Frame Collage Maker

A browser-based collage editor for building reusable photo layouts and exporting them as JPG or PNG images.

**Live site:** https://al-qassim.github.io/collage-maker/

## Features

- Split, resize, remove, and rearrange collage areas
- Divider snapping at common layout ratios
- Import, reposition, and zoom individual images
- Reusable built-in and user-saved layouts
- Configurable canvas size, spacing, and corner radius
- JPG and PNG export
- Undo and redo
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

## Deployment

Pushes to `main` are automatically built and deployed to GitHub Pages by the workflow in `.github/workflows/deploy-pages.yml`.
