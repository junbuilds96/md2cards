# MD2Cards

Markdown in, polished social cards out.

MD2Cards is a local web tool for turning Markdown snippets into exportable PNG cards for product launches, documentation posts, and social updates. It includes starter templates, platform presets, live Markdown rendering, visual themes, and browser-based PNG copy/download actions.

## Quickstart

```bash
npm install
npm run dev
```

Open the local Vite URL shown in your terminal.

Choose a starter template, paste or edit your Markdown, then use Copy PNG or Download.

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
- `html-to-image` for browser PNG export
- Starter templates for an X launch post, Xiaohongshu insight card, and GitHub release/update
- Presets for X/Twitter landscape, Xiaohongshu portrait, and GitHub/launch square
- Multiple visual themes with template-matched defaults

## Notes

PNG copy uses the browser Clipboard API when available. If image clipboard support is unavailable, use the download action.
