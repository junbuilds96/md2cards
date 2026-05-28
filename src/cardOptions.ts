export type PresetId = 'twitter' | 'xiaohongshu' | 'launch';

export type ThemeId = 'signal' | 'paper' | 'midnight' | 'editorial';

export type ExportScaleId = 'fast' | 'crisp';

export type CardDensityId = 'compact' | 'balanced' | 'spacious';

export type CardTypographyScaleId = 'small' | 'default' | 'large';

export type CardAccentId = 'blue' | 'emerald' | 'rose' | 'amber';

export type PlatformPreset = {
  id: PresetId;
  label: string;
  sizeLabel: string;
  width: number;
  height: number;
};

export type PlatformFitHelper = {
  presetId: PresetId;
  bestFor: string;
  pasteTip: string;
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

export type CardDensityOption = {
  id: CardDensityId;
  label: string;
  description: string;
  className: string;
};

export type CardTypographyScaleOption = {
  id: CardTypographyScaleId;
  label: string;
  description: string;
  className: string;
};

export type CardAccentOption = {
  id: CardAccentId;
  label: string;
  color: string;
  softColor: string;
  faintColor: string;
  glowColor: string;
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

export type RecipePresetId = 'launch' | 'changelog' | 'tutorial' | 'insight' | 'quote' | 'code-snippet';

export type RecipePreset = {
  id: RecipePresetId;
  label: string;
  description: string;
  presetId: PresetId;
  themeId: ThemeId;
  cardDensityId: CardDensityId;
  cardTypographyScaleId: CardTypographyScaleId;
  cardAccentId: CardAccentId;
  showCardLabels: boolean;
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
  action: string;
};

export type MarkdownFitLimits = {
  characterLimit: number;
  lineLimit: number;
  bulletLimit: number;
  paragraphCharacterLimit: number;
  tableDataRowLimit: number;
  codeLineLimit: number;
};

export type MarkdownFitResult = {
  markdown: string;
  changed: boolean;
  note: string;
  changes: string[];
};

export type OnboardingWorkflowStep = {
  id: 'choose-start' | 'paste-markdown' | 'check-fit' | 'select-export' | 'export-card';
  label: string;
  detail: string;
};

export const onboardingWorkflowSteps: OnboardingWorkflowStep[] = [
  {
    id: 'choose-start',
    label: 'Pick template or Start Blank',
    detail: 'Use a paste-ready example, or clear the editor for your own card.',
  },
  {
    id: 'paste-markdown',
    label: 'Paste or import Markdown',
    detail: 'Replace the starter with text, or drop in a local Markdown draft.',
  },
  {
    id: 'check-fit',
    label: 'Check length and safe area',
    detail: 'Use the line/character counter and preview overlay before exporting.',
  },
  {
    id: 'select-export',
    label: 'Choose platform/export quality',
    detail: 'Set the card size and pick Fast preview or Crisp share.',
  },
  {
    id: 'export-card',
    label: 'Export PNG/SVG',
    detail: 'Copy a PNG, download a PNG, or download an SVG.',
  },
];

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

export const platformFitHelpers: PlatformFitHelper[] = [
  {
    presetId: 'twitter',
    bestFor: 'a launch hook, 2-3 proof bullets, and one clear next step.',
    pasteTip: 'Paste the post people should understand at a glance; move details and links to the caption.',
  },
  {
    presetId: 'xiaohongshu',
    bestFor: 'a portrait checklist, mini-framework, or creator takeaway with 3-5 short points.',
    pasteTip: 'Paste saveable advice with a strong headline; avoid wide tables and long code blocks.',
  },
  {
    presetId: 'launch',
    bestFor: 'a release note, changelog highlight, or GitHub launch summary.',
    pasteTip: 'Paste one version/update, then keep the card to highlights, status, and a short call to action.',
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

export const defaultCardDensityId: CardDensityId = 'balanced';

export const defaultCardTypographyScaleId: CardTypographyScaleId = 'default';

export const defaultCardAccentId: CardAccentId = 'blue';

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

export const cardDensityOptions: CardDensityOption[] = [
  {
    id: 'compact',
    label: 'Compact',
    description: 'Tighter padding and rhythm for denser posts.',
    className: 'density-compact',
  },
  {
    id: 'balanced',
    label: 'Balanced',
    description: 'Default spacing for most cards.',
    className: 'density-balanced',
  },
  {
    id: 'spacious',
    label: 'Spacious',
    description: 'Airier padding for short, editorial cards.',
    className: 'density-spacious',
  },
];

export const cardTypographyScaleOptions: CardTypographyScaleOption[] = [
  {
    id: 'small',
    label: 'Small',
    description: 'Smaller type for longer Markdown cards.',
    className: 'type-small',
  },
  {
    id: 'default',
    label: 'Default',
    description: 'Current MD2Cards type scale.',
    className: 'type-default',
  },
  {
    id: 'large',
    label: 'Large',
    description: 'Larger type for short, poster-like cards.',
    className: 'type-large',
  },
];

export const cardAccentOptions: CardAccentOption[] = [
  {
    id: 'blue',
    label: 'Blue',
    color: '#1f6feb',
    softColor: 'rgba(31, 111, 235, 0.13)',
    faintColor: 'rgba(31, 111, 235, 0.24)',
    glowColor: 'rgba(31, 111, 235, 0.2)',
  },
  {
    id: 'emerald',
    label: 'Emerald',
    color: '#15956b',
    softColor: 'rgba(21, 149, 107, 0.14)',
    faintColor: 'rgba(21, 149, 107, 0.25)',
    glowColor: 'rgba(21, 149, 107, 0.2)',
  },
  {
    id: 'rose',
    label: 'Rose',
    color: '#e25579',
    softColor: 'rgba(226, 85, 121, 0.14)',
    faintColor: 'rgba(226, 85, 121, 0.25)',
    glowColor: 'rgba(226, 85, 121, 0.2)',
  },
  {
    id: 'amber',
    label: 'Amber',
    color: '#c47a12',
    softColor: 'rgba(196, 122, 18, 0.15)',
    faintColor: 'rgba(196, 122, 18, 0.28)',
    glowColor: 'rgba(196, 122, 18, 0.2)',
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

export const recipePresets: RecipePreset[] = [
  {
    id: 'launch',
    label: 'Launch',
    description: 'Wide announcement with proof bullets and visible product chrome.',
    presetId: 'twitter',
    themeId: 'signal',
    cardDensityId: 'balanced',
    cardTypographyScaleId: 'default',
    cardAccentId: 'blue',
    showCardLabels: true,
    markdown: `# Launch faster with Markdown cards

Turn a product update into a share-ready visual in one pass.

- One hook for the feed
- Three proof points for context
- PNG or SVG export when it is ready`,
  },
  {
    id: 'changelog',
    label: 'Changelog',
    description: 'Square technical release summary with compact type and status table.',
    presetId: 'launch',
    themeId: 'midnight',
    cardDensityId: 'compact',
    cardTypographyScaleId: 'small',
    cardAccentId: 'emerald',
    showCardLabels: true,
    markdown: `# v0.4.0 Changelog

## Highlights

- Recipe presets for common card types
- Cleaner appearance controls
- Stable exact-size PNG and SVG export

| Area | Status |
| --- | --- |
| Presets | Shipped |
| Export | Stable |
| Docs | Updated |`,
  },
  {
    id: 'tutorial',
    label: 'Tutorial',
    description: 'Portrait walkthrough for saveable steps and mini-guides.',
    presetId: 'xiaohongshu',
    themeId: 'paper',
    cardDensityId: 'balanced',
    cardTypographyScaleId: 'default',
    cardAccentId: 'amber',
    showCardLabels: false,
    markdown: `# Turn notes into a card

## 3-step workflow

1. Paste the Markdown draft
2. Pick a recipe that matches the job
3. Fit the copy before exporting

> Keep each step short enough to scan without the caption.`,
  },
  {
    id: 'insight',
    label: 'Insight',
    description: 'Portrait creator takeaway with larger type and editorial color.',
    presetId: 'xiaohongshu',
    themeId: 'editorial',
    cardDensityId: 'spacious',
    cardTypographyScaleId: 'large',
    cardAccentId: 'rose',
    showCardLabels: false,
    markdown: `# The card is the hook

People decide whether to read the caption from the first two seconds.

- Lead with the outcome
- Make the proof visual
- Leave one clear next step`,
  },
  {
    id: 'quote',
    label: 'Quote',
    description: 'Airy square quote card with warm editorial styling.',
    presetId: 'launch',
    themeId: 'paper',
    cardDensityId: 'spacious',
    cardTypographyScaleId: 'large',
    cardAccentId: 'rose',
    showCardLabels: false,
    markdown: `# "Design tools should disappear when the idea is clear."

Use Markdown for structure. Use recipes for the visual rhythm.

- MD2Cards`,
  },
  {
    id: 'code-snippet',
    label: 'Code Snippet',
    description: 'Dark landscape card tuned for short command or API examples.',
    presetId: 'twitter',
    themeId: 'midnight',
    cardDensityId: 'compact',
    cardTypographyScaleId: 'small',
    cardAccentId: 'emerald',
    showCardLabels: true,
    markdown: `# Export a card from Markdown

\`\`\`bash
npm install
npm run build
npm run preview
\`\`\`

- React Markdown rendering
- Exact preset dimensions
- PNG and SVG output`,
  },
];

export function getMarkdownTemplate(templateId: TemplateId): MarkdownTemplate {
  return markdownTemplates.find((template) => template.id === templateId) ?? markdownTemplates[0];
}

export function getStarterMarkdown(templateId: TemplateId): string {
  return getMarkdownTemplate(templateId).markdown;
}

export function getRecipePreset(recipePresetId: RecipePresetId): RecipePreset {
  return recipePresets.find((recipePreset) => recipePreset.id === recipePresetId) ?? recipePresets[0];
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

export function getPlatformFitHelper(preset: PlatformPreset): PlatformFitHelper {
  return (
    platformFitHelpers.find((helper) => helper.presetId === preset.id) ??
    platformFitHelpers[platformFitHelpers.length - 1]
  );
}

function getDenseMarkdownAction(stats: MarkdownStats, lineLimit: number, characterLimit: number): string {
  const overLineLimit = stats.nonEmptyLineCount > lineLimit;
  const overCharacterLimit = stats.characterCount > characterLimit;

  if (overLineLimit && overCharacterLimit) {
    return 'Trim to one headline, 3-5 bullets, and one CTA, or split this into multiple cards.';
  }

  if (overLineLimit) {
    return 'Shorten long lists, remove extra sections, or split each section into its own card.';
  }

  return 'Tighten sentences, keep one proof point, and move background detail to the caption.';
}

export function getMarkdownFitLimits(preset: PlatformPreset): MarkdownFitLimits {
  if (preset.height > preset.width) {
    return {
      characterLimit: 1100,
      lineLimit: 16,
      bulletLimit: 5,
      paragraphCharacterLimit: 220,
      tableDataRowLimit: 4,
      codeLineLimit: 6,
    };
  }

  if (preset.height === preset.width) {
    return {
      characterLimit: 950,
      lineLimit: 13,
      bulletLimit: 4,
      paragraphCharacterLimit: 190,
      tableDataRowLimit: 3,
      codeLineLimit: 5,
    };
  }

  return {
    characterLimit: 900,
    lineLimit: 12,
    bulletLimit: 3,
    paragraphCharacterLimit: 170,
    tableDataRowLimit: 2,
    codeLineLimit: 4,
  };
}

export function getMarkdownFitGuidance(markdown: string, preset: PlatformPreset): MarkdownFitGuidance {
  const stats = getMarkdownStats(markdown);
  const { lineLimit, characterLimit } = getMarkdownFitLimits(preset);
  const isDense = stats.nonEmptyLineCount > lineLimit || stats.characterCount > characterLimit;

  if (stats.isBlank) {
    return {
      stats,
      characterLimit,
      lineLimit,
      tone: 'empty',
      summary: 'Paste your Markdown to start.',
      action: getPlatformFitHelper(preset).pasteTip,
    };
  }

  if (isDense) {
    return {
      stats,
      characterLimit,
      lineLimit,
      tone: 'dense',
      summary: 'This may feel crowded on export.',
      action: getDenseMarkdownAction(stats, lineLimit, characterLimit),
    };
  }

  return {
    stats,
    characterLimit,
    lineLimit,
    tone: 'ready',
    summary: 'Good length for this card.',
    action: `Fits best as ${getPlatformFitHelper(preset).bestFor}`,
  };
}

function addChange(changes: string[], change: string) {
  if (!changes.includes(change)) {
    changes.push(change);
  }
}

function normalizeMarkdownLines(markdown: string): { lines: string[]; changed: boolean } {
  const normalizedMarkdown = markdown.replace(/\r\n?/g, '\n');
  const trimmedLines = normalizedMarkdown.split('\n').map((line) => line.replace(/[ \t]+$/g, ''));
  const lines: string[] = [];
  let previousWasBlank = true;

  for (const line of trimmedLines) {
    if (line.trim().length === 0) {
      if (!previousWasBlank) {
        lines.push('');
        previousWasBlank = true;
      }
      continue;
    }

    lines.push(line);
    previousWasBlank = false;
  }

  while (lines[lines.length - 1] === '') {
    lines.pop();
  }

  return {
    lines,
    changed: lines.join('\n') !== markdown,
  };
}

function shortenText(text: string, characterLimit: number): { text: string; changed: boolean } {
  const normalizedText = text.replace(/\s+/g, ' ').trim();

  if (normalizedText.length <= characterLimit) {
    return {
      text: normalizedText,
      changed: normalizedText !== text,
    };
  }

  const clipped = normalizedText.slice(0, Math.max(0, characterLimit - 3));
  const wordBoundary = clipped.lastIndexOf(' ');
  const cutIndex = wordBoundary > characterLimit * 0.55 ? wordBoundary : clipped.length;

  return {
    text: `${clipped.slice(0, cutIndex).trimEnd()}...`,
    changed: true,
  };
}

function compactListBlock(lines: string[], limits: MarkdownFitLimits): { block: string; changes: string[] } {
  const changes: string[] = [];
  const keptLines = lines.slice(0, limits.bulletLimit).map((line) => {
    const listMatch = line.match(/^(\s*(?:[-*+]|\d+[.)])\s+)(.+)$/);

    if (!listMatch) {
      return line;
    }

    const shortened = shortenText(listMatch[2], Math.min(130, limits.paragraphCharacterLimit));
    if (shortened.changed) {
      addChange(changes, 'shortened long list items');
    }

    return `${listMatch[1]}${shortened.text}`;
  });

  if (lines.length > keptLines.length) {
    addChange(changes, `capped lists at ${limits.bulletLimit} items`);
  }

  return {
    block: keptLines.join('\n'),
    changes,
  };
}

function compactTableBlock(lines: string[], limits: MarkdownFitLimits): { block: string; changes: string[] } {
  const requiredHeaderRows = 2;
  const maxRows = requiredHeaderRows + limits.tableDataRowLimit;

  if (lines.length <= maxRows) {
    return {
      block: lines.join('\n'),
      changes: [],
    };
  }

  return {
    block: lines.slice(0, maxRows).join('\n'),
    changes: [`kept the first ${limits.tableDataRowLimit} table rows`],
  };
}

function compactCodeBlock(lines: string[], limits: MarkdownFitLimits): { block: string; changes: string[] } {
  if (lines.length <= limits.codeLineLimit + 2) {
    return {
      block: lines.join('\n'),
      changes: [],
    };
  }

  const firstLine = lines[0];
  const lastLine = lines[lines.length - 1]?.startsWith('```') ? lines[lines.length - 1] : '```';
  const codeLines = lines.slice(1, -1).slice(0, limits.codeLineLimit);

  return {
    block: [firstLine, ...codeLines, lastLine].join('\n'),
    changes: [`kept the first ${limits.codeLineLimit} code lines`],
  };
}

function compactParagraphBlock(lines: string[], limits: MarkdownFitLimits): { block: string; changes: string[] } {
  const prefixMatch = lines.length === 1 ? lines[0].match(/^(>\s+)(.+)$/) : null;
  const paragraph = prefixMatch ? prefixMatch[2] : lines.join(' ');
  const shortened = shortenText(paragraph, limits.paragraphCharacterLimit);
  const changes: string[] = [];

  if (lines.length > 1) {
    addChange(changes, 'merged wrapped paragraphs');
  }

  if (shortened.changed) {
    addChange(changes, 'shortened long paragraphs');
  }

  return {
    block: prefixMatch ? `${prefixMatch[1]}${shortened.text}` : shortened.text,
    changes,
  };
}

function compactMarkdownBlocks(lines: string[], limits: MarkdownFitLimits): { blocks: string[]; changes: string[] } {
  const blocks: string[] = [];
  const changes: string[] = [];
  let headingCount = 0;
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];

    if (line === '') {
      index += 1;
      continue;
    }

    if (/^#{1,6}\s+\S/.test(line.trim())) {
      headingCount += 1;
      if (headingCount <= 2) {
        const headingMatch = line.trim().match(/^(#{1,6}\s+)(.+)$/);
        const headingText = headingMatch ? shortenText(headingMatch[2], Math.min(90, limits.paragraphCharacterLimit)) : null;

        if (headingMatch && headingText) {
          if (headingText.changed) {
            addChange(changes, 'shortened long headings');
          }
          blocks.push(`${headingMatch[1]}${headingText.text}`);
        } else {
          blocks.push(line.trim());
        }
      } else {
        addChange(changes, 'kept the first two headings');
      }
      index += 1;
      continue;
    }

    if (line.trim().startsWith('```')) {
      const codeLines = [line];
      index += 1;

      while (index < lines.length) {
        codeLines.push(lines[index]);
        const closesFence = lines[index].trim().startsWith('```');
        index += 1;
        if (closesFence) break;
      }

      const compacted = compactCodeBlock(codeLines, limits);
      blocks.push(compacted.block);
      compacted.changes.forEach((change) => addChange(changes, change));
      continue;
    }

    if (/^\s*(?:[-*+]|\d+[.)])\s+\S/.test(line)) {
      const listLines: string[] = [];

      while (index < lines.length && /^\s*(?:[-*+]|\d+[.)])\s+\S/.test(lines[index])) {
        listLines.push(lines[index]);
        index += 1;
      }

      const compacted = compactListBlock(listLines, limits);
      blocks.push(compacted.block);
      compacted.changes.forEach((change) => addChange(changes, change));
      continue;
    }

    if (line.includes('|')) {
      const tableLines: string[] = [];

      while (index < lines.length && lines[index].includes('|') && lines[index].trim().length > 0) {
        tableLines.push(lines[index]);
        index += 1;
      }

      const compacted = compactTableBlock(tableLines, limits);
      blocks.push(compacted.block);
      compacted.changes.forEach((change) => addChange(changes, change));
      continue;
    }

    const paragraphLines: string[] = [];

    while (
      index < lines.length &&
      lines[index].trim().length > 0 &&
      !/^#{1,6}\s+\S/.test(lines[index].trim()) &&
      !/^\s*(?:[-*+]|\d+[.)])\s+\S/.test(lines[index]) &&
      !lines[index].trim().startsWith('```') &&
      !lines[index].includes('|')
    ) {
      paragraphLines.push(lines[index]);
      index += 1;
    }

    const compacted = compactParagraphBlock(paragraphLines, limits);
    blocks.push(compacted.block);
    compacted.changes.forEach((change) => addChange(changes, change));
  }

  return { blocks, changes };
}

function joinBlocks(blocks: string[]): string {
  return blocks.filter((block) => block.trim().length > 0).join('\n\n');
}

function enforceFitLimits(blocks: string[], limits: MarkdownFitLimits): { markdown: string; changed: boolean } {
  const keptBlocks: string[] = [];

  for (const block of blocks) {
    const candidate = joinBlocks([...keptBlocks, block]);
    const stats = getMarkdownStats(candidate);

    if (
      keptBlocks.length === 0 ||
      (stats.nonEmptyLineCount <= limits.lineLimit && stats.characterCount <= limits.characterLimit)
    ) {
      keptBlocks.push(block);
    }
  }

  return {
    markdown: joinBlocks(keptBlocks),
    changed: keptBlocks.length < blocks.length,
  };
}

export function fitMarkdownToPreset(markdown: string, preset: PlatformPreset): MarkdownFitResult {
  if (getMarkdownStats(markdown).isBlank) {
    return {
      markdown: '',
      changed: false,
      note: 'Paste Markdown before fitting this card.',
      changes: [],
    };
  }

  const limits = getMarkdownFitLimits(preset);
  const changes: string[] = [];
  const normalized = normalizeMarkdownLines(markdown);

  if (normalized.changed) {
    addChange(changes, 'normalized spacing');
  }

  const compacted = compactMarkdownBlocks(normalized.lines, limits);
  compacted.changes.forEach((change) => addChange(changes, change));

  const fitted = enforceFitLimits(compacted.blocks, limits);
  if (fitted.changed) {
    addChange(changes, `kept content within ${limits.lineLimit} lines and ${limits.characterLimit} chars`);
  }

  const changed = fitted.markdown !== markdown;
  if (changed && changes.length === 0) {
    addChange(changes, 'tightened Markdown for this preset');
  }

  const note = changed
    ? `Fitted for ${preset.label}: ${changes.join('; ')}.`
    : `Already fits ${preset.label}. No changes made.`;

  return {
    markdown: fitted.markdown,
    changed,
    note,
    changes,
  };
}

export function getExportScaleOption(exportScaleId: ExportScaleId): ExportScaleOption {
  return exportScaleOptions.find((option) => option.id === exportScaleId) ?? exportScaleOptions[1];
}

export function getCardDensityOption(cardDensityId: CardDensityId): CardDensityOption {
  return cardDensityOptions.find((option) => option.id === cardDensityId) ?? cardDensityOptions[1];
}

export function getCardTypographyScaleOption(
  cardTypographyScaleId: CardTypographyScaleId,
): CardTypographyScaleOption {
  return cardTypographyScaleOptions.find((option) => option.id === cardTypographyScaleId) ?? cardTypographyScaleOptions[1];
}

export function getCardAccentOption(cardAccentId: CardAccentId): CardAccentOption {
  return cardAccentOptions.find((option) => option.id === cardAccentId) ?? cardAccentOptions[0];
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
