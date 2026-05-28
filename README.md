# MD2Cards

Markdown in, polished cards out.

MD2Cards is a local web app for turning Markdown snippets into exportable PNG and SVG social cards. It is built for product launches, release notes, documentation posts, and creator updates where you want a clean image without opening a design tool.

![MD2Cards screenshot](docs/assets/md2cards-screenshot.png)

<p align="center"><sub>Paste Markdown, choose a platform preset, preview safe areas, then export PNG/SVG cards locally.</sub></p>

## Why MD2Cards

- Write once in Markdown and preview the card live.
- Start from paste-ready examples for launch posts, GitHub releases, and Xiaohongshu-style insight cards.
- Export landscape, portrait, or square cards for common sharing surfaces.
- Check line count, character count, safe areas, and export size before downloading.
- Copy PNGs to the clipboard, download crisp PNGs, or keep reusable SVG output.

## Quickstart

```bash
npm install
npm run dev
```

Open the local Vite URL, choose a starter or select **Start Blank**, paste Markdown, pick a platform preset and theme, then use **Copy PNG**, **Download PNG**, or **Download SVG**.

## Common Use Cases

- Launch announcements that need a stronger visual than plain text.
- Changelog and release-note cards for GitHub, docs, and newsletters.
- Technical snippets with headings, lists, tables, code, and quotes.
- Creator or team updates that should fit a known platform crop.

## Workflow

1. Pick a paste-ready template or start with an empty editor.
2. Paste or edit Markdown while the preview updates.
3. Use the fit guidance and safe-area overlay to keep the card readable.
4. Choose a platform preset, visual theme, and PNG export quality.
5. Copy or download the finished card.

## Features

- GitHub-flavored Markdown rendering with `react-markdown` and `remark-gfm`.
- Browser-based PNG and SVG export powered by `html-to-image`.
- Presets for X/Twitter landscape, Xiaohongshu portrait, and GitHub/launch square.
- Themes for crisp launch notes, editorial posts, paper-style notes, and dark technical updates.
- Starter templates that map to sensible preset/theme defaults.
- Fast 1x preview export and crisp 2x share export.
- Clipboard PNG support when the browser allows image clipboard writes.

## Tech Stack

- Vite
- React
- TypeScript
- `react-markdown`
- `remark-gfm`
- `html-to-image`
- Vitest

## Scripts

```bash
npm run dev      # Start the local web app
npm run build    # Type-check and build production assets
npm run test     # Run tests
npm run preview  # Preview the production build
```

## Roadmap

- More card templates for launches, docs, changelogs, and creator posts.
- Saved local presets for repeatable team styles.
- More precise platform guidance as sharing surfaces change.
- Import/export of reusable card configurations.

## Contributing

Issues and pull requests are welcome. For changes that affect rendering or export behavior, include a focused test or a clear manual verification note.

## License

MIT. See [LICENSE](LICENSE).
