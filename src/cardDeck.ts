import {
  fitMarkdownToPreset,
  getMarkdownFitLimits,
  getMarkdownStats,
  type PlatformPreset,
  type PresetId,
} from './cardOptions';

export type CardDeckCard = {
  id: string;
  index: number;
  title: string;
  markdown: string;
  note: string;
};

export type CardDeckCaption = {
  presetId: PresetId;
  label: string;
  text: string;
};

export type CardDeck = {
  id: string;
  title: string;
  presetId: PresetId;
  cards: CardDeckCard[];
  captions: CardDeckCaption[];
  captionText: string;
  note: string;
  notes: string[];
};

export type CardDeckSplitOptions = {
  maxCards?: number;
};

export type CardDeckSplitResult = {
  deck: CardDeck | null;
  note: string;
};

type SourceBlock =
  | {
      type: 'heading';
      depth: number;
      title: string;
      markdown: string;
    }
  | {
      type: 'paragraph' | 'code' | 'table';
      markdown: string;
    }
  | {
      type: 'list';
      items: string[];
    };

type Section = {
  title: string;
  blocks: SourceBlock[];
};

type CardSegment = {
  markdown: string;
  note?: string;
  forceCard?: boolean;
};

function addUnique(items: string[], item: string) {
  if (item && !items.includes(item)) {
    items.push(item);
  }
}

function stripMarkdownText(markdown: string): string {
  return markdown
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^\s*(?:[-*+]|\d+[.)])\s+/gm, '')
    .replace(/[`*_~>|[\]()]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function shortenPlainText(text: string, limit: number): string {
  const normalized = text.replace(/\s+/g, ' ').trim();

  if (normalized.length <= limit) {
    return normalized;
  }

  const clipped = normalized.slice(0, Math.max(0, limit - 3));
  const boundary = clipped.lastIndexOf(' ');
  const cutIndex = boundary > limit * 0.55 ? boundary : clipped.length;

  return `${clipped.slice(0, cutIndex).trimEnd()}...`;
}

function getHeadingText(line: string): { depth: number; title: string } | null {
  const match = line.trim().match(/^(#{1,6})\s+(.+)$/);

  if (!match) {
    return null;
  }

  return {
    depth: match[1].length,
    title: stripMarkdownText(match[2]) || 'Untitled',
  };
}

function isListLine(line: string): boolean {
  return /^\s*(?:[-*+]|\d+[.)])\s+\S/.test(line);
}

function isLikelyTableLine(line: string): boolean {
  return line.includes('|') && line.trim().length > 0;
}

function parseSourceBlocks(markdown: string): { title: string | null; blocks: SourceBlock[] } {
  const lines = markdown.replace(/\r\n?/g, '\n').split('\n');
  const blocks: SourceBlock[] = [];
  let title: string | null = null;
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];

    if (line.trim().length === 0) {
      index += 1;
      continue;
    }

    if (line.trim().startsWith('```')) {
      const codeLines = [line.trimEnd()];
      index += 1;

      while (index < lines.length) {
        codeLines.push(lines[index].trimEnd());
        const closesFence = lines[index].trim().startsWith('```');
        index += 1;
        if (closesFence) break;
      }

      blocks.push({ type: 'code', markdown: codeLines.join('\n') });
      continue;
    }

    const heading = getHeadingText(line);
    if (heading) {
      if (heading.depth === 1 && !title) {
        title = heading.title;
      } else {
        blocks.push({
          type: 'heading',
          depth: heading.depth,
          title: heading.title,
          markdown: `${'#'.repeat(heading.depth)} ${heading.title}`,
        });
      }
      index += 1;
      continue;
    }

    if (isListLine(line)) {
      const items: string[] = [];

      while (index < lines.length && isListLine(lines[index])) {
        items.push(lines[index].trimEnd());
        index += 1;
      }

      blocks.push({ type: 'list', items });
      continue;
    }

    if (isLikelyTableLine(line)) {
      const tableLines: string[] = [];

      while (index < lines.length && isLikelyTableLine(lines[index])) {
        tableLines.push(lines[index].trimEnd());
        index += 1;
      }

      blocks.push({ type: 'table', markdown: tableLines.join('\n') });
      continue;
    }

    const paragraphLines: string[] = [];

    while (
      index < lines.length &&
      lines[index].trim().length > 0 &&
      !getHeadingText(lines[index]) &&
      !isListLine(lines[index]) &&
      !lines[index].trim().startsWith('```') &&
      !isLikelyTableLine(lines[index])
    ) {
      paragraphLines.push(lines[index].trim());
      index += 1;
    }

    blocks.push({ type: 'paragraph', markdown: paragraphLines.join(' ') });
  }

  return { title, blocks };
}

function titleFromBlocks(blocks: SourceBlock[]): string {
  const firstBlock = blocks.find((block) => {
    if (block.type === 'list') {
      return block.items.length > 0;
    }

    return stripMarkdownText(block.markdown).length > 0;
  });

  if (!firstBlock) {
    return 'Untitled deck';
  }

  if (firstBlock.type === 'list') {
    return shortenPlainText(stripMarkdownText(firstBlock.items[0]), 68) || 'Untitled deck';
  }

  return shortenPlainText(stripMarkdownText(firstBlock.markdown), 68) || 'Untitled deck';
}

function createSections(deckTitle: string, blocks: SourceBlock[]): Section[] {
  const hasSectionHeadings = blocks.some((block) => block.type === 'heading' && block.depth >= 2 && block.depth <= 3);

  if (!hasSectionHeadings) {
    return [{ title: deckTitle, blocks }];
  }

  const sections: Section[] = [];
  let current: Section | null = null;

  for (const block of blocks) {
    if (block.type === 'heading' && block.depth >= 2 && block.depth <= 3) {
      if (current && current.blocks.length > 0) {
        sections.push(current);
      }
      current = {
        title: block.title,
        blocks: [],
      };
      continue;
    }

    if (!current) {
      current = {
        title: deckTitle,
        blocks: [],
      };
    }

    current.blocks.push(block);
  }

  if (current && current.blocks.length > 0) {
    sections.push(current);
  }

  return sections;
}

function splitParagraphIntoSegments(markdown: string, characterLimit: number): string[] {
  const text = markdown.replace(/\s+/g, ' ').trim();

  if (text.length <= characterLimit) {
    return [text];
  }

  const sentences = text.match(/[^。！？.!?]+[。！？.!?]?/g)?.map((item) => item.trim()).filter(Boolean) ?? [text];
  const chunks: string[] = [];
  let current = '';

  for (const sentence of sentences) {
    const candidate = [current, sentence].filter(Boolean).join(' ');

    if (candidate.length <= characterLimit || current.length === 0) {
      current = candidate;
      continue;
    }

    chunks.push(current);
    current = sentence;
  }

  if (current) {
    chunks.push(current);
  }

  return chunks.flatMap((chunk) => {
    if (chunk.length <= characterLimit) {
      return [chunk];
    }

    const pieces: string[] = [];
    let rest = chunk;

    while (rest.length > characterLimit) {
      const clipped = rest.slice(0, characterLimit);
      const boundary = clipped.lastIndexOf(' ');
      const cutIndex = boundary > characterLimit * 0.55 ? boundary : clipped.length;
      pieces.push(rest.slice(0, cutIndex).trim());
      rest = rest.slice(cutIndex).trim();
    }

    if (rest) {
      pieces.push(rest);
    }

    return pieces;
  });
}

function expandBlock(block: SourceBlock, preset: PlatformPreset): CardSegment[] {
  const limits = getMarkdownFitLimits(preset);

  if (block.type === 'list') {
    const chunks: CardSegment[] = [];

    for (let index = 0; index < block.items.length; index += limits.bulletLimit) {
      chunks.push({
        markdown: block.items.slice(index, index + limits.bulletLimit).join('\n'),
        forceCard: true,
      });
    }

    return chunks;
  }

  if (block.type === 'paragraph') {
    return splitParagraphIntoSegments(block.markdown, Math.min(limits.paragraphCharacterLimit, 180)).map((chunk) => ({
      markdown: chunk,
    }));
  }

  if (block.type === 'code') {
    const lines = block.markdown.split('\n');
    const firstLine = lines[0]?.startsWith('```') ? lines[0] : '```';
    const lastLine = lines[lines.length - 1]?.trim().startsWith('```') ? lines[lines.length - 1] : '```';
    const keptCode = lines.slice(1, -1).slice(0, limits.codeLineLimit);

    return [
      {
        markdown: [firstLine, ...keptCode, lastLine].join('\n'),
        note: 'source contained code; kept the first lines on-card',
        forceCard: true,
      },
    ];
  }

  if (block.type === 'table') {
    const lines = block.markdown.split('\n');
    const keptRows = lines.slice(0, 2 + limits.tableDataRowLimit);

    return [
      {
        markdown: keptRows.join('\n'),
        note: 'source contained table; kept the first rows on-card',
        forceCard: true,
      },
    ];
  }

  return [{ markdown: block.markdown }];
}

function buildCardMarkdown(title: string, segments: CardSegment[]): string {
  return [`# ${shortenPlainText(title, 90)}`, ...segments.map((segment) => segment.markdown)].join('\n\n').trim();
}

function fitsPreset(markdown: string, preset: PlatformPreset): boolean {
  const stats = getMarkdownStats(markdown);
  const limits = getMarkdownFitLimits(preset);

  return stats.characterCount <= limits.characterLimit && stats.nonEmptyLineCount <= limits.lineLimit;
}

function makeCard(
  sectionTitle: string,
  segments: CardSegment[],
  preset: PlatformPreset,
  notes: string[],
): Omit<CardDeckCard, 'id' | 'index'> {
  const rawMarkdown = buildCardMarkdown(sectionTitle, segments);
  const fitted = fitMarkdownToPreset(rawMarkdown, preset);
  const cardNotes: string[] = [];

  for (const segment of segments) {
    if (segment.note) {
      addUnique(cardNotes, segment.note);
      addUnique(notes, segment.note);
    }
  }

  if (fitted.changed) {
    addUnique(cardNotes, fitted.note);
    addUnique(notes, 'some cards were tightened to stay inside platform limits');
  }

  return {
    title: sectionTitle,
    markdown: fitted.markdown,
    note: cardNotes.join(' ') || 'Fitted for platform-safe export.',
  };
}

function cardsFromSection(section: Section, preset: PlatformPreset, deckNotes: string[]): Omit<CardDeckCard, 'id' | 'index'>[] {
  const cards: Omit<CardDeckCard, 'id' | 'index'>[] = [];
  const segments = section.blocks.flatMap((block) => expandBlock(block, preset));
  let currentSegments: CardSegment[] = [];

  for (const segment of segments) {
    if (segment.forceCard && currentSegments.length > 0) {
      cards.push(makeCard(section.title, currentSegments, preset, deckNotes));
      currentSegments = [];
    }

    const candidateSegments = [...currentSegments, segment];
    const candidateMarkdown = buildCardMarkdown(section.title, candidateSegments);

    if (currentSegments.length === 0 || fitsPreset(candidateMarkdown, preset)) {
      currentSegments = candidateSegments;
    } else {
      cards.push(makeCard(section.title, currentSegments, preset, deckNotes));
      currentSegments = [segment];
    }

    if (segment.forceCard) {
      cards.push(makeCard(section.title, currentSegments, preset, deckNotes));
      currentSegments = [];
    }
  }

  if (currentSegments.length > 0) {
    cards.push(makeCard(section.title, currentSegments, preset, deckNotes));
  }

  return cards;
}

function summarizeCard(card: CardDeckCard): string {
  const lines = card.markdown
    .split('\n')
    .map((line) => stripMarkdownText(line))
    .filter(Boolean)
    .filter((line) => line !== card.title);

  return shortenPlainText(lines[0] || card.title, 96);
}

function trimCaption(text: string): string {
  return shortenPlainText(text, 900);
}

function createCaptions(title: string, cards: CardDeckCard[], activePresetId: PresetId, notes: string[]): CardDeckCaption[] {
  const summaries = cards.slice(0, 6).map((card) => `${card.index + 1}. ${card.title}: ${summarizeCard(card)}`);
  const bulletSummaries = cards.slice(0, 6).map((card) => `- ${card.title}: ${summarizeCard(card)}`);
  const sourceNote =
    notes.some((note) => note.includes('code') || note.includes('table'))
      ? '\n\nNote: source contained code/table; full detail stays in the source.'
      : '';

  const captions: CardDeckCaption[] = [
    {
      presetId: 'twitter',
      label: 'Twitter/X thread',
      text: trimCaption(`Thread: ${title}\n\n${summaries.join('\n')}\n\nFull notes in source / details below.${sourceNote}`),
    },
    {
      presetId: 'xiaohongshu',
      label: 'Xiaohongshu caption',
      text: trimCaption(`${title}\n\n要点：\n${bulletSummaries.join('\n')}\n\n收藏备用，评论告诉我你想看哪一部分。${sourceNote}`),
    },
    {
      presetId: 'launch',
      label: 'GitHub/Launch caption',
      text: trimCaption(`${title}\n\nHighlights:\n${bulletSummaries.join('\n')}\n\nRepo/update: see the source for full notes.${sourceNote}`),
    },
  ];

  return captions.sort((a, b) => (a.presetId === activePresetId ? -1 : b.presetId === activePresetId ? 1 : 0));
}

function deckIdFromTitle(title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);

  return slug || 'md2cards-deck';
}

export function splitMarkdownIntoCardDeck(
  markdown: string,
  preset: PlatformPreset,
  options: CardDeckSplitOptions = {},
): CardDeckSplitResult {
  if (getMarkdownStats(markdown).isBlank) {
    return {
      deck: null,
      note: 'Paste Markdown before splitting it into a deck.',
    };
  }

  const parsed = parseSourceBlocks(markdown);
  const title = parsed.title || titleFromBlocks(parsed.blocks);
  const sections = createSections(title, parsed.blocks);
  const deckNotes: string[] = [];
  const cards = sections
    .flatMap((section) => cardsFromSection(section, preset, deckNotes))
    .slice(0, options.maxCards ?? Number.POSITIVE_INFINITY)
    .map((card, index) => ({
      ...card,
      id: `${deckIdFromTitle(title)}-${String(index + 1).padStart(2, '0')}`,
      index,
    }));

  if (cards.length === 0) {
    return {
      deck: null,
      note: 'No card-sized content was found in this Markdown.',
    };
  }

  if (options.maxCards && cards.length >= options.maxCards) {
    addUnique(deckNotes, `deck capped at ${options.maxCards} cards`);
  }

  const captions = createCaptions(title, cards, preset.id, deckNotes);
  const note =
    cards.length === 1
      ? `Created 1 fitted card for ${preset.label}.`
      : `Created ${cards.length} fitted cards for ${preset.label}.`;

  return {
    deck: {
      id: deckIdFromTitle(title),
      title,
      presetId: preset.id,
      cards,
      captions,
      captionText: captions[0]?.text ?? '',
      note,
      notes: deckNotes,
    },
    note,
  };
}
