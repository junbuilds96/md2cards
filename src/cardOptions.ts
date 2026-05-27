export type PresetId = 'twitter' | 'xiaohongshu' | 'launch';

export type ThemeId = 'signal' | 'paper' | 'midnight' | 'editorial';

export type PlatformPreset = {
  id: PresetId;
  label: string;
  sizeLabel: string;
  width: number;
  height: number;
};

export type CardTheme = {
  id: ThemeId;
  label: string;
  className: string;
  description: string;
};

export type TemplateId = 'x-launch' | 'xiaohongshu-insight' | 'github-release';

export type MarkdownTemplate = {
  id: TemplateId;
  label: string;
  description: string;
  presetId: PresetId;
  themeId: ThemeId;
  markdown: string;
};

export const platformPresets: PlatformPreset[] = [
  {
    id: 'twitter',
    label: 'X / Twitter',
    sizeLabel: '1600 x 900',
    width: 1600,
    height: 900,
  },
  {
    id: 'xiaohongshu',
    label: 'Xiaohongshu',
    sizeLabel: '1080 x 1440',
    width: 1080,
    height: 1440,
  },
  {
    id: 'launch',
    label: 'GitHub / Launch',
    sizeLabel: '1200 x 1200',
    width: 1200,
    height: 1200,
  },
];

export const cardThemes: CardTheme[] = [
  {
    id: 'signal',
    label: 'Signal',
    className: 'theme-signal',
    description: 'Crisp white, blue accents, and launch-note contrast.',
  },
  {
    id: 'paper',
    label: 'Paper',
    className: 'theme-paper',
    description: 'Warm editorial surface with ink-like typography.',
  },
  {
    id: 'midnight',
    label: 'Midnight',
    className: 'theme-midnight',
    description: 'Dark, focused, and high-contrast for technical posts.',
  },
  {
    id: 'editorial',
    label: 'Editorial',
    className: 'theme-editorial',
    description: 'Magazine-style color blocks for creator updates.',
  },
];

export const markdownTemplates: MarkdownTemplate[] = [
  {
    id: 'x-launch',
    label: 'X Launch Post',
    description: 'A concise product announcement with proof points and a clear CTA.',
    presetId: 'twitter',
    themeId: 'signal',
    markdown: `# Ship notes that travel

Turn a Markdown update into a polished card without opening a design tool.

## Today in MD2Cards

- Platform presets for launch posts
- GitHub-flavored Markdown support
- Browser-native PNG export

| Output | Best for |
| --- | --- |
| Landscape | X / Twitter |
| Portrait | Xiaohongshu |
| Square | GitHub launches |

\`npm run build\` and share the result.`,
  },
  {
    id: 'xiaohongshu-insight',
    label: 'Xiaohongshu Insight',
    description: 'A saveable portrait card for a creator takeaway or mini-framework.',
    presetId: 'xiaohongshu',
    themeId: 'editorial',
    markdown: `# 3 signals your launch card is working

People should understand the update before they read the caption.

## Quick checklist

- One specific outcome in the headline
- A short before/after or metric
- One action the reader can take next

> Treat the card like a tiny product page, not a screenshot dump.

\`Hook -> Proof -> Next step\``,
  },
  {
    id: 'github-release',
    label: 'GitHub Release',
    description: 'A square technical update for changelogs, releases, and repo posts.',
    presetId: 'launch',
    themeId: 'midnight',
    markdown: `# MD2Cards v0.2.0

Markdown cards now feel faster to draft and easier to share.

## Highlights

- Added template starters for common posts
- Improved export filenames from Markdown headings
- Kept rendering on \`react-markdown\` + \`remark-gfm\`

| Area | Status |
| --- | --- |
| Templates | Added |
| PNG export | Stable |
| OSS setup | Ready |

Try it with your next release note.`,
  },
];

export const sampleMarkdown = markdownTemplates[0].markdown;
