# MD2Cards

Markdown in, polished social cards out.

MD2Cards is a local web tool for turning Markdown snippets into exportable PNG and SVG cards for product launches, documentation posts, and social updates. It includes starter templates, platform presets, live Markdown rendering, visual themes, and browser-based PNG copy plus PNG/SVG download actions.

## Quickstart

```bash
npm install
npm run dev
```

Open the local Vite URL shown in your terminal.

Choose a paste-ready example or Start Blank, paste or edit your own Markdown, and use the line/character guidance to keep the card readable. Use the safe area guide to keep key content clear of platform crops and overlays, pick Fast preview or Crisp share export quality for PNGs, then use Copy PNG, Download PNG, or Download SVG.

## Scripts

```bash
npm run dev      # Start the local web app
npm run build    # Type-check and build production assets
npm run test     # Run the smoke tests
npm run preview  # Preview the production build
```

## What is included

- Vite + React + TypeScript
- `react-markdown` with `remark-gfm` for GitHub-flavored Markdown
- `html-to-image` for browser PNG and SVG export
- Starter templates for an X launch post, Xiaohongshu insight card, and GitHub release/update
- Blank-start onboarding with Markdown line and character guidance
- Presets for X/Twitter landscape, Xiaohongshu portrait, and GitHub/launch square
- Multiple visual themes with template-matched defaults
- Preview-only safe area guides for checking approximate platform-safe margins before export
- Export quality controls for fast 1x previews or crisp 2x share PNGs, plus reusable SVG downloads

## Notes

PNG copy uses the browser Clipboard API when available. If image clipboard support is unavailable, use the PNG or SVG download action.
