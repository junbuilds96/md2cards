export type PresetId = 'twitter' | 'xiaohongshu' | 'launch';

export type ThemeId = 'signal' | 'paper' | 'midnight' | 'editorial';

export type ExportScaleId = 'fast' | 'crisp';

export type PlatformPreset = {
  id: PresetId;
  label: string;
  sizeLabel: string;
  width: number;
  height: number;
};

export type SafeAreaGuide = {
  marginPercent: number;
  horizontalMargin: number;
  verticalMargin: number;
  contentWidth: number;
  contentHeight: number;
  marginLabel: string;
};

export type CardTheme = {
  id: ThemeId;
  label: string;
  className: string;
  description: string;
};

export type ExportScaleOption = {
  id: ExportScaleId;
  label: string;
  scale: number;
  shortLabel: string;
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

export type MarkdownStats = {
  characterCount: number;
  lineCount: number;
  nonEmptyLineCount: number;
  headingCount: number;
  isBlank: boolean;
};

export type MarkdownFitGuidance = {
  stats: MarkdownStats;
  characterLimit: number;
  lineLimit: number;
  tone: 'empty' | 'ready' | 'dense';
  summary: string;
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

export const defaultExportScaleId: ExportScaleId = 'crisp';

export const exportScaleOptions: ExportScaleOption[] = [
  {
    id: 'fast',
    label: 'Fast preview',
    scale: 1,
    shortLabel: '1x',
    description: 'Quickest render for drafts and layout checks.',
  },
  {
    id: 'crisp',
    label: 'Crisp share',
    scale: 2,
    shortLabel: '2x',
    description: 'Sharper PNG for posting and sharing.',
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
- Browser-native PNG and SVG export

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
| PNG/SVG export | Stable |
| OSS setup | Ready |

Try it with your next release note.`,
  },
];

export const sampleMarkdown = markdownTemplates[0].markdown;

export function getMarkdownTemplate(templateId: TemplateId): MarkdownTemplate {
  return markdownTemplates.find((template) => template.id === templateId) ?? markdownTemplates[0];
}

export function getStarterMarkdown(templateId: TemplateId): string {
  return getMarkdownTemplate(templateId).markdown;
}

export function getMarkdownStats(markdown: string): MarkdownStats {
  const normalizedMarkdown = markdown.replace(/\r\n?/g, '\n');
  const trimmedMarkdown = normalizedMarkdown.trim();
  const lines = trimmedMarkdown.length > 0 ? normalizedMarkdown.split('\n') : [];

  return {
    characterCount: trimmedMarkdown.length,
    lineCount: lines.length,
    nonEmptyLineCount: lines.filter((line) => line.trim().length > 0).length,
    headingCount: lines.filter((line) => /^#{1,3}\s+\S/.test(line.trim())).length,
    isBlank: trimmedMarkdown.length === 0,
  };
}

export function getMarkdownFitGuidance(markdown: string, preset: PlatformPreset): MarkdownFitGuidance {
  const stats = getMarkdownStats(markdown);
  const isPortrait = preset.height > preset.width;
  const isSquare = preset.height === preset.width;
  const lineLimit = isPortrait ? 16 : isSquare ? 13 : 12;
  const characterLimit = isPortrait ? 1100 : isSquare ? 950 : 900;
  const isDense = stats.nonEmptyLineCount > lineLimit || stats.characterCount > characterLimit;

  if (stats.isBlank) {
    return {
      stats,
      characterLimit,
      lineLimit,
      tone: 'empty',
      summary: 'Paste your Markdown to start.',
    };
  }

  return {
    stats,
    characterLimit,
    lineLimit,
    tone: isDense ? 'dense' : 'ready',
    summary: isDense ? 'This may feel crowded on export.' : 'Good length for this card.',
  };
}

export function getExportScaleOption(exportScaleId: ExportScaleId): ExportScaleOption {
  return exportScaleOptions.find((option) => option.id === exportScaleId) ?? exportScaleOptions[1];
}

export function getExportPixelSize(
  preset: PlatformPreset,
  exportScale: ExportScaleOption,
): { width: number; height: number } {
  return {
    width: Math.round(preset.width * exportScale.scale),
    height: Math.round(preset.height * exportScale.scale),
  };
}

export function getSafeAreaMarginPercent(preset: PlatformPreset): number {
  if (preset.height > preset.width) {
    return 8;
  }

  if (preset.width === preset.height) {
    return 7.5;
  }

  return 7;
}

export function getSafeAreaGuide(preset: PlatformPreset): SafeAreaGuide {
  const marginPercent = getSafeAreaMarginPercent(preset);
  const horizontalMargin = Math.round((preset.width * marginPercent) / 100);
  const verticalMargin = Math.round((preset.height * marginPercent) / 100);

  return {
    marginPercent,
    horizontalMargin,
    verticalMargin,
    contentWidth: preset.width - horizontalMargin * 2,
    contentHeight: preset.height - verticalMargin * 2,
    marginLabel: `~${horizontalMargin}px sides / ~${verticalMargin}px top-bottom`,
  };
}
