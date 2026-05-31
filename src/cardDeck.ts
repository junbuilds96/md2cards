import {
  fitMarkdownToPreset,
  getMarkdownFitLimits,
  getMarkdownStats,
  type PlatformPreset,
  type PresetId,
} from './cardOptions';
import {
  getMarkdownCodeFenceMarker,
  isMarkdownCodeFenceClose,
  isMarkdownCodeFenceLine,
  normalizeMarkdownCodeFenceBlock,
} from './markdownCodeFences';
import { getInlineSafeCutIndex } from './markdownInline';
import {
  isMarkdownTableDelimiterLine,
  isMarkdownTableRowLine,
  isMarkdownTableStart,
  splitMarkdownTableCells,
} from './markdownTables';

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
      type: 'paragraph' | 'quote' | 'code' | 'table';
      markdown: string;
    }
  | {
      type: 'break';
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
  breakBefore?: boolean;
};

type StorySegment = {
  markdown: string;
  note?: string;
};

function addUnique(items: string[], item: string) {
  if (item && !items.includes(item)) {
    items.push(item);
  }
}

function stripMarkdownText(markdown: string): string {
  return markdown
    .replace(/^\s{0,3}\[[^\]]+\]:\s+\S.*$/gm, '')
    .replace(/!?\[([^\]]*)\]\((?:\\.|[^)])*\)/g, '$1')
    .replace(/!?\[([^\]]*)\]\[[^\]]*\]/g, '$1')
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
  const match = line.trim().match(/^(#{1,6})(\s+|(?=[\u4e00-\u9fff])|(?=\S))(.+)$/u);

  if (!match) {
    return null;
  }

  const depth = match[1].length;
  const hasRequiredSpace = /\s/.test(match[2]);
  const startsWithCjk = /^[\u4e00-\u9fff]/u.test(match[3]);

  if (depth === 1 && !hasRequiredSpace && !startsWithCjk) {
    return null;
  }

  return {
    depth,
    title: stripMarkdownText(match[3]) || 'Untitled',
  };
}

function getSetextHeadingText(line: string, nextLine: string | undefined): { depth: number; title: string } | null {
  const titleText = line.trim();
  const underline = nextLine?.trim() ?? '';
  const isParagraphLike =
    titleText.length > 0 &&
    !getHeadingText(line) &&
    !isListLine(line) &&
    !isMarkdownQuoteLine(line) &&
    !isMarkdownCodeFenceLine(line) &&
    !isMarkdownTableRowLine(line);

  if (!isParagraphLike) {
    return null;
  }

  if (/^=+\s*$/.test(underline)) {
    return {
      depth: 1,
      title: stripMarkdownText(titleText) || 'Untitled',
    };
  }

  if (/^-{3,}\s*$/.test(underline)) {
    return {
      depth: 2,
      title: stripMarkdownText(titleText) || 'Untitled',
    };
  }

  return null;
}

function getListMarkerIndent(line: string): number | null {
  const match = line.match(/^(\s*)(?:[-*+]|\d+[.)])\s+\S/);

  return match ? match[1].length : null;
}

function isListLine(line: string): boolean {
  return getListMarkerIndent(line) !== null;
}

function isListContinuationLine(line: string): boolean {
  const trimmed = line.trim();

  return (
    /^\s{2,}\S/.test(line) &&
    trimmed.length > 0 &&
    !getHeadingText(line) &&
    !isMarkdownCodeFenceLine(line) &&
    !isHorizontalRuleLine(line) &&
    !isMarkdownTableRowLine(line)
  );
}

function isHorizontalRuleLine(line: string): boolean {
  const compactLine = line.trim().replace(/[ \t]+/g, '');

  return /^(?:-{3,}|\*{3,}|_{3,})$/.test(compactLine);
}

function getNextNonEmptyLineIndex(lines: string[], index: number): number | null {
  for (let nextIndex = index; nextIndex < lines.length; nextIndex += 1) {
    if (lines[nextIndex].trim().length > 0) {
      return nextIndex;
    }
  }

  return null;
}

function isMarkdownReferenceDefinitionLine(line: string): boolean {
  return /^\s{0,3}\[[^\]\n]+\]:\s+\S/.test(line);
}

function isMarkdownQuoteLine(line: string): boolean {
  return line.trim().startsWith('>');
}

export function detectNarrativeMarkdown(markdown: string): boolean {
  const lines = markdown.replace(/\r\n?/g, '\n').split('\n');
  const nonEmptyLines = lines.map((line) => line.trim()).filter(Boolean);
  const plainText = stripMarkdownText(markdown);
  const chineseCharacterCount = plainText.match(/[\u4e00-\u9fff]/g)?.length ?? 0;

  if (nonEmptyLines.length < 8 || chineseCharacterCount < 40) {
    return false;
  }

  const headingCount = nonEmptyLines.filter((line) => /^#{1,6}\s+/.test(line)).length;
  const h2H3Count = nonEmptyLines.filter((line) => /^#{2,3}\s+/.test(line)).length;
  const listLineCount = nonEmptyLines.filter(isListLine).length;
  const quoteLineCount = nonEmptyLines.filter(isMarkdownQuoteLine).length;
  const sceneBreakCount = nonEmptyLines.filter(isHorizontalRuleLine).length;
  const dialogueLineCount = nonEmptyLines.filter((line) => /[“”"「」『』]/.test(line)).length;
  const shortLineCount = nonEmptyLines.filter((line) => stripMarkdownText(line).length <= 56).length;
  const paragraphLikeCount = nonEmptyLines.filter(
    (line) => !/^#{1,6}\s+/.test(line) && !isListLine(line) && !isHorizontalRuleLine(line),
  ).length;

  let score = 0;

  if (shortLineCount / nonEmptyLines.length >= 0.55) score += 1;
  if (paragraphLikeCount >= 10) score += 1;
  if (dialogueLineCount >= 3) score += 1;
  if (quoteLineCount >= 1) score += 1;
  if (sceneBreakCount >= 1) score += 1;
  if (h2H3Count <= 2 && headingCount <= 3) score += 1;
  if (listLineCount / nonEmptyLines.length <= 0.12) score += 1;

  return score >= 5;
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

    if (isMarkdownReferenceDefinitionLine(line)) {
      index += 1;
      continue;
    }

    const openingFence = getMarkdownCodeFenceMarker(line);
    if (openingFence) {
      const codeLines = [line.trimEnd()];
      index += 1;

      while (index < lines.length) {
        codeLines.push(lines[index].trimEnd());
        const closesFence = isMarkdownCodeFenceClose(lines[index], openingFence);
        index += 1;
        if (closesFence) break;
      }

      blocks.push({ type: 'code', markdown: codeLines.join('\n') });
      continue;
    }

    if (isHorizontalRuleLine(line)) {
      blocks.push({ type: 'break' });
      index += 1;
      continue;
    }

    const setextHeading = getSetextHeadingText(line, lines[index + 1]);
    if (setextHeading) {
      if (setextHeading.depth === 1 && !title) {
        title = setextHeading.title;
      } else {
        blocks.push({
          type: 'heading',
          depth: setextHeading.depth,
          title: setextHeading.title,
          markdown: `${'#'.repeat(setextHeading.depth)} ${setextHeading.title}`,
        });
      }
      index += 2;
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
      let currentItem = '';
      const baseIndent = getListMarkerIndent(line) ?? 0;

      while (index < lines.length) {
        if (lines[index].trim().length === 0) {
          const nextNonEmptyIndex = getNextNonEmptyLineIndex(lines, index + 1);
          const nextLine = nextNonEmptyIndex === null ? null : lines[nextNonEmptyIndex];
          const nextMarkerIndent = nextLine === null ? null : getListMarkerIndent(nextLine);
          const continuesLooseItem =
            currentItem.length > 0 &&
            nextLine !== null &&
            (isListContinuationLine(nextLine) || (nextMarkerIndent !== null && nextMarkerIndent >= baseIndent));

          if (!continuesLooseItem) {
            break;
          }

          if (nextMarkerIndent === null) {
            currentItem = `${currentItem}\n${lines[index].trimEnd()}`;
          }
          index += 1;
          continue;
        }

        const markerIndent = getListMarkerIndent(lines[index]);

        if (markerIndent !== null) {
          if (currentItem && markerIndent > baseIndent) {
            currentItem = `${currentItem}\n${lines[index].trimEnd()}`;
            index += 1;
            continue;
          }

          if (currentItem) {
            items.push(currentItem);
          }
          currentItem = lines[index].trimEnd();
          index += 1;
          continue;
        }

        if (currentItem && isListContinuationLine(lines[index])) {
          currentItem = `${currentItem}\n${lines[index].trimEnd()}`;
          index += 1;
          continue;
        }

        break;
      }

      if (currentItem) {
        items.push(currentItem);
      }

      blocks.push({ type: 'list', items });
      continue;
    }

    if (isMarkdownQuoteLine(line)) {
      const quoteLines: string[] = [];

      while (index < lines.length && isMarkdownQuoteLine(lines[index])) {
        quoteLines.push(lines[index].trimEnd());
        index += 1;
      }

      blocks.push({ type: 'quote', markdown: quoteLines.join('\n') });
      continue;
    }

    if (isMarkdownTableStart(lines, index)) {
      const tableLines: string[] = [lines[index].trimEnd(), lines[index + 1].trimEnd()];
      index += 2;

      while (index < lines.length && lines[index].trim().length > 0 && isMarkdownTableRowLine(lines[index])) {
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
      !isMarkdownQuoteLine(lines[index]) &&
      !isMarkdownCodeFenceLine(lines[index]) &&
      !isHorizontalRuleLine(lines[index]) &&
      !isMarkdownReferenceDefinitionLine(lines[index]) &&
      !isMarkdownTableStart(lines, index)
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
    if (block.type === 'break') {
      return false;
    }

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

  if (firstBlock.type === 'break') {
    return 'Untitled deck';
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

function getSentenceBoundaryEnd(text: string, index: number): number | null {
  const character = text[index];
  const consumeClosingMarks = (boundaryIndex: number) => {
    let boundaryEnd = boundaryIndex;

    while (/["')\]”’」』）】》]/.test(text[boundaryEnd + 1] ?? '')) {
      boundaryEnd += 1;
    }

    return boundaryEnd;
  };

  if ('。！？'.includes(character)) {
    return consumeClosingMarks(index);
  }

  if (!'.!?'.includes(character)) {
    return null;
  }

  const boundaryEnd = consumeClosingMarks(index);
  const nextCharacter = text[boundaryEnd + 1];
  return nextCharacter === undefined || /\s/.test(nextCharacter) ? boundaryEnd : null;
}

function splitTextIntoSentences(text: string): string[] {
  const sentences: string[] = [];
  let start = 0;
  let index = 0;

  while (index < text.length) {
    const boundaryEnd = getSentenceBoundaryEnd(text, index);

    if (boundaryEnd !== null) {
      const sentence = text.slice(start, boundaryEnd + 1).trim();
      if (sentence) {
        sentences.push(sentence);
      }
      start = boundaryEnd + 1;
      index = start;
      continue;
    }

    index += 1;
  }

  const tail = text.slice(start).trim();
  if (tail) {
    sentences.push(tail);
  }

  return sentences;
}

function splitParagraphIntoSegments(markdown: string, characterLimit: number): string[] {
  const text = markdown.replace(/\s+/g, ' ').trim();

  if (text.length <= characterLimit) {
    return [text];
  }

  const sentences = splitTextIntoSentences(text);
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
      const preferredCutIndex = boundary > characterLimit * 0.55 ? boundary : clipped.length;
      const cutIndex = getInlineSafeCutIndex(rest, preferredCutIndex);
      pieces.push(rest.slice(0, cutIndex).trim());
      rest = rest.slice(cutIndex).trim();
    }

    if (rest) {
      pieces.push(rest);
    }

    return pieces;
  });
}

function splitOversizedListItem(item: string, lineLimit: number): string[] {
  const lines = item.split('\n').filter((line) => line.trim().length > 0);
  const firstCardLineLimit = Math.max(1, lineLimit - 1);
  const continuedCardLineLimit = Math.max(1, lineLimit - 2);

  if (lines.length <= firstCardLineLimit) {
    return [item];
  }

  const [firstLine = '', ...continuationLines] = lines;
  const listMatch = firstLine.match(/^(\s*(?:[-*+]|\d+[.)])\s+)(.+)$/);
  const continuedMarker = `${listMatch?.[1] ?? '- '}${shortenPlainText(stripMarkdownText(listMatch?.[2] ?? firstLine), 72)} (continued)`;
  const chunks = [[firstLine, ...continuationLines.slice(0, firstCardLineLimit - 1)].join('\n')];
  let index = firstCardLineLimit - 1;

  while (index < continuationLines.length) {
    chunks.push([continuedMarker, ...continuationLines.slice(index, index + continuedCardLineLimit)].join('\n'));
    index += continuedCardLineLimit;
  }

  return chunks;
}

function expandBlock(block: SourceBlock, preset: PlatformPreset): CardSegment[] {
  const limits = getMarkdownFitLimits(preset);

  if (block.type === 'break') {
    return [{ markdown: '', breakBefore: true }];
  }

  if (block.type === 'list') {
    const chunks: CardSegment[] = [];
    const maxListLines = Math.max(1, limits.lineLimit - 1);
    let currentItems: string[] = [];
    let currentLineCount = 0;

    const flushCurrentItems = () => {
      if (currentItems.length === 0) {
        return;
      }

      chunks.push({
        markdown: currentItems.join('\n'),
        forceCard: true,
      });
      currentItems = [];
      currentLineCount = 0;
    };

    for (const item of block.items) {
      const itemChunks = splitOversizedListItem(item, limits.lineLimit);

      if (itemChunks.length > 1) {
        flushCurrentItems();
        for (const itemChunk of itemChunks) {
          chunks.push({
            markdown: itemChunk,
            note: 'split an oversized list item across cards',
            forceCard: true,
          });
        }
        continue;
      }

      const itemLineCount = itemChunks[0].split('\n').filter((line) => line.trim().length > 0).length;
      const exceedsItemLimit = currentItems.length >= limits.bulletLimit;
      const exceedsLineLimit = currentItems.length > 0 && currentLineCount + itemLineCount > maxListLines;

      if (exceedsItemLimit || exceedsLineLimit) {
        flushCurrentItems();
      }

      currentItems.push(itemChunks[0]);
      currentLineCount += itemLineCount;
    }

    flushCurrentItems();

    return chunks;
  }

  if (block.type === 'paragraph') {
    return splitParagraphIntoSegments(block.markdown, limits.paragraphCharacterLimit).map((chunk) => ({
      markdown: chunk,
    }));
  }

  if (block.type === 'quote') {
    const quoteLines = block.markdown.split('\n');
    const maxQuoteLines = Math.max(1, limits.lineLimit - 1);
    const chunks: CardSegment[] = [];

    for (let index = 0; index < quoteLines.length; index += maxQuoteLines) {
      chunks.push({
        markdown: quoteLines.slice(index, index + maxQuoteLines).join('\n'),
      });
    }

    return chunks;
  }

  if (block.type === 'code') {
    const lines = block.markdown.split('\n');
    const normalized = normalizeMarkdownCodeFenceBlock(lines, limits.codeLineLimit);
    const codeNotes = ['source contained code'];

    return [
      {
        markdown: normalized.markdown,
        note: [
          ...codeNotes,
          normalized.truncated ? 'kept the first lines on-card' : '',
          normalized.closedFence ? 'closed an unterminated code fence' : '',
        ]
          .filter(Boolean)
          .join('; '),
        forceCard: true,
      },
    ];
  }

  if (block.type === 'table') {
    const lines = block.markdown.split('\n');
    const headerRows = lines.slice(0, 2);
    const dataRows = lines.slice(2);
    const maxDataRows = Math.max(1, limits.tableDataRowLimit);

    if (dataRows.length === 0) {
      return [
        {
          markdown: headerRows.join('\n'),
          note: 'source contained table',
          forceCard: true,
        },
      ];
    }

    const chunks: CardSegment[] = [];

    for (let index = 0; index < dataRows.length; index += maxDataRows) {
      const rowChunk = dataRows.slice(index, index + maxDataRows);
      chunks.push({
        markdown: [...headerRows, ...rowChunk].join('\n'),
        note:
          dataRows.length > maxDataRows
            ? 'source contained table; split table rows across cards'
            : 'source contained table',
        forceCard: true,
      });
    }

    return chunks;
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
    if (segment.breakBefore) {
      if (currentSegments.length > 0) {
        cards.push(makeCard(section.title, currentSegments, preset, deckNotes));
        currentSegments = [];
      }
      continue;
    }

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

function splitStoryText(markdown: string, characterLimit: number): string[] {
  const nonEmptyLines = markdown.split('\n').filter((line) => line.trim().length > 0);
  const isQuote = nonEmptyLines.length > 0 && nonEmptyLines.every((line) => line.trim().startsWith('>'));
  const prefix = isQuote ? '> ' : '';
  const rawText = isQuote ? markdown.replace(/^>\s?/gm, '') : markdown;
  const text = rawText.replace(/\s+/g, ' ').trim();

  if (text.length <= characterLimit) {
    return [`${prefix}${text}`.trimEnd()];
  }

  return splitParagraphIntoSegments(text, characterLimit).map((segment) => `${prefix}${segment}`.trimEnd());
}

function parseStorySegments(markdown: string): { title: string | null; segments: Array<StorySegment | 'break'> } {
  const lines = markdown.replace(/\r\n?/g, '\n').split('\n');
  const segments: Array<StorySegment | 'break'> = [];
  let title: string | null = null;
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    const trimmed = line.trim();

    if (trimmed.length === 0) {
      index += 1;
      continue;
    }

    if (isMarkdownReferenceDefinitionLine(line)) {
      index += 1;
      continue;
    }

    const heading = getHeadingText(line);
    if (heading?.depth === 1) {
      if (!title) {
        title = heading.title;
      }
      index += 1;
      continue;
    }

    if (isHorizontalRuleLine(line)) {
      segments.push('break');
      index += 1;
      continue;
    }

    const openingFence = getMarkdownCodeFenceMarker(line);
    if (openingFence) {
      const codeLines = [line.trimEnd()];
      index += 1;

      while (index < lines.length) {
        codeLines.push(lines[index].trimEnd());
        const closesFence = isMarkdownCodeFenceClose(lines[index], openingFence);
        index += 1;
        if (closesFence) break;
      }

      segments.push({ markdown: codeLines.join('\n') });
      continue;
    }

    if (trimmed.startsWith('>')) {
      const quoteLines: string[] = [];

      while (index < lines.length && lines[index].trim().startsWith('>')) {
        quoteLines.push(lines[index].trimEnd());
        index += 1;
      }

      for (const chunk of splitStoryText(quoteLines.join('\n'), 180)) {
        segments.push({ markdown: chunk });
      }
      continue;
    }

    if (isMarkdownTableStart(lines, index)) {
      const tableLines: string[] = [lines[index].trimEnd(), lines[index + 1].trimEnd()];
      index += 2;

      while (index < lines.length && lines[index].trim().length > 0 && isMarkdownTableRowLine(lines[index])) {
        tableLines.push(lines[index].trimEnd());
        index += 1;
      }

      segments.push({ markdown: tableLines.join('\n') });
      continue;
    }

    if (isListLine(line)) {
      while (index < lines.length) {
        const markerIndent = getListMarkerIndent(lines[index]);

        if (markerIndent === null) {
          break;
        }

        const baseIndent = markerIndent;
        const itemLines = [lines[index].trimEnd()];
        index += 1;

        while (index < lines.length) {
          if (lines[index].trim().length === 0) {
            const nextNonEmptyIndex = getNextNonEmptyLineIndex(lines, index + 1);
            const nextLine = nextNonEmptyIndex === null ? null : lines[nextNonEmptyIndex];
            const nextMarkerIndent = nextLine === null ? null : getListMarkerIndent(nextLine);
            const continuesLooseItem =
              nextLine !== null &&
              (isListContinuationLine(nextLine) || (nextMarkerIndent !== null && nextMarkerIndent > baseIndent));

            if (!continuesLooseItem) {
              break;
            }

            if (nextMarkerIndent === null) {
              itemLines.push(lines[index].trimEnd());
            }
            index += 1;
            continue;
          }

          const continuationMarkerIndent = getListMarkerIndent(lines[index]);

          if (continuationMarkerIndent !== null && continuationMarkerIndent > baseIndent) {
            itemLines.push(lines[index].trimEnd());
            index += 1;
            continue;
          }

          if (isListContinuationLine(lines[index])) {
            itemLines.push(lines[index].trimEnd());
            index += 1;
            continue;
          }

          break;
        }

        segments.push({ markdown: itemLines.join('\n') });
      }
      continue;
    }

    const paragraphLines: string[] = [];

    while (
      index < lines.length &&
      lines[index].trim().length > 0 &&
      !isHorizontalRuleLine(lines[index]) &&
      !isMarkdownCodeFenceLine(lines[index]) &&
      !isMarkdownReferenceDefinitionLine(lines[index]) &&
      !lines[index].trim().startsWith('>') &&
      !isMarkdownTableStart(lines, index) &&
      !isListLine(lines[index]) &&
      getHeadingText(lines[index])?.depth !== 1
    ) {
      paragraphLines.push(lines[index].trim());
      index += 1;
    }

    for (const chunk of splitStoryText(paragraphLines.join(' '), 180)) {
      segments.push({ markdown: chunk });
    }
  }

  return { title, segments };
}

function getStoryCardLimits(preset: PlatformPreset): { characterLimit: number; targetLineLimit: number; maxLineLimit: number } {
  const limits = getMarkdownFitLimits(preset);

  return {
    characterLimit: Math.min(limits.characterLimit, 420),
    targetLineLimit: preset.id === 'twitter' ? 4 : 5,
    maxLineLimit: Math.min(limits.lineLimit, preset.id === 'twitter' ? 7 : 8),
  };
}

function simplifyStoryTableCellLinks(cell: string): string {
  return cell
    .replace(/!\[([^\]]*)\]\((?:\\.|[^)])*\)/g, '$1')
    .replace(/\[([^\]]+)\]\((?:\\.|[^)])*\)/g, '$1');
}

function shortenStoryTableCell(cell: string, characterLimit: number): { text: string; changed: boolean } {
  const normalized = cell.replace(/\s+/g, ' ').trim();
  const linkSimplified = normalized.length > characterLimit ? simplifyStoryTableCellLinks(normalized) : normalized;

  if (linkSimplified.length <= characterLimit) {
    return {
      text: linkSimplified,
      changed: linkSimplified !== cell,
    };
  }

  const clipped = linkSimplified.slice(0, Math.max(0, characterLimit - 3));
  const boundary = clipped.lastIndexOf(' ');
  const preferredCutIndex = boundary > characterLimit * 0.55 ? boundary : clipped.length;
  const cutIndex = getInlineSafeCutIndex(linkSimplified, preferredCutIndex, characterLimit - 3);

  return {
    text: `${linkSimplified.slice(0, cutIndex).trimEnd()}...`,
    changed: true,
  };
}

function compactStoryTableLine(line: string, cellCharacterLimit: number): { line: string; changed: boolean } {
  const cells = splitMarkdownTableCells(line);

  if (cells.length < 2 || isMarkdownTableDelimiterLine(line)) {
    return { line, changed: false };
  }

  let changed = false;
  const compactedCells = cells.map((cell) => {
    const shortened = shortenStoryTableCell(cell, cellCharacterLimit);

    if (shortened.changed) {
      changed = true;
    }

    return shortened.text;
  });

  return {
    line: changed ? `| ${compactedCells.join(' | ')} |` : line,
    changed,
  };
}

function compactStoryTableSegment(
  lines: string[],
  limits: ReturnType<typeof getStoryCardLimits>,
): { markdown: string; changed: boolean } {
  let compactedLines = [...lines];
  let changed = false;

  for (const cellCharacterLimit of [96, 72, 56, 44, 32, 24]) {
    const nextLines = lines.map((line) => compactStoryTableLine(line, cellCharacterLimit));
    compactedLines = nextLines.map((line) => line.line);
    changed = nextLines.some((line) => line.changed);

    if (getMarkdownStats(compactedLines.join('\n')).characterCount <= limits.characterLimit) {
      break;
    }
  }

  return {
    markdown: compactedLines.join('\n'),
    changed,
  };
}

function fitStorySegmentToLimits(
  segment: StorySegment,
  limits: ReturnType<typeof getStoryCardLimits>,
): StorySegment[] {
  const stats = getMarkdownStats(segment.markdown);

  if (stats.characterCount <= limits.characterLimit && stats.nonEmptyLineCount <= limits.maxLineLimit) {
    return [segment];
  }

  const lines = segment.markdown.split('\n');
  const openingFence = getMarkdownCodeFenceMarker(lines[0] ?? '');

  if (openingFence) {
    const codeLineLimit = Math.max(1, limits.maxLineLimit - 3);
    const codeLineCharacterLimit = Math.max(48, Math.floor(limits.characterLimit / Math.max(1, codeLineLimit + 2)));
    const normalized = normalizeMarkdownCodeFenceBlock(lines, codeLineLimit, codeLineCharacterLimit);
    const notes = [
      segment.note,
      'tightened oversized story code block',
      normalized.truncated ? 'kept the first story-safe code lines' : '',
      normalized.shortenedLines ? 'shortened long code lines' : '',
      normalized.closedFence ? 'closed an unterminated code fence' : '',
    ].filter(Boolean);

    return [
      {
        markdown: normalized.markdown,
        note: notes.join('; '),
      },
    ];
  }

  if (isMarkdownTableStart(lines, 0)) {
    const headerRows = lines.slice(0, 2);
    const dataRows = lines.slice(2);
    const maxDataRows = Math.max(1, limits.maxLineLimit - headerRows.length);
    const rowChunks =
      dataRows.length > 0
        ? Array.from({ length: Math.ceil(dataRows.length / maxDataRows) }, (_, chunkIndex) =>
            dataRows.slice(chunkIndex * maxDataRows, (chunkIndex + 1) * maxDataRows),
          )
        : [[]];

    const segments: StorySegment[] = [];

    for (const rowChunk of rowChunks) {
      const hasMoreRows = dataRows.length > maxDataRows;
      const compacted = compactStoryTableSegment([...headerRows, ...rowChunk], limits);
      segments.push({
        markdown: compacted.markdown,
        note: [
          segment.note,
          hasMoreRows ? 'split story table rows across cards' : '',
          compacted.changed ? 'shortened wide story table cells' : '',
        ]
          .filter(Boolean)
          .join('; '),
      });
    }

    return segments;
  }

  return [segment];
}

function buildStoryCardMarkdown(title: string, segments: StorySegment[], includeTitle: boolean): string {
  return [includeTitle ? `# ${shortenPlainText(title, 90)}` : '', ...segments.map((segment) => segment.markdown)]
    .filter(Boolean)
    .join('\n\n')
    .trim();
}

function storyCandidateFits(
  title: string,
  segments: StorySegment[],
  includeTitle: boolean,
  characterLimit: number,
  lineLimit: number,
): boolean {
  const stats = getMarkdownStats(buildStoryCardMarkdown(title, segments, includeTitle));

  return stats.characterCount <= characterLimit && stats.nonEmptyLineCount <= lineLimit;
}

function createStoryCaptions(title: string, cards: CardDeckCard[], activePresetId: PresetId): CardDeckCaption[] {
  const totalText = `共 ${cards.length} 张卡`;
  const firstLine = summarizeCard(cards[0]);
  const lastLine = summarizeCard(cards[cards.length - 1]);
  const captions: CardDeckCaption[] = [
    {
      presetId: 'twitter',
      label: 'Twitter/X thread',
      text: trimCaption(`《${title}》\n\n${totalText}，一段适合慢慢翻完的短篇故事。\n\n开场：${firstLine}\n收束：${lastLine}`),
    },
    {
      presetId: 'xiaohongshu',
      label: 'Xiaohongshu caption',
      text: trimCaption(`《${title}》\n\n${totalText}。把这一段告别拆成连载卡片，适合一张张读完。\n\n开场：${firstLine}`),
    },
    {
      presetId: 'launch',
      label: 'GitHub/Launch caption',
      text: trimCaption(`《${title}》\n\n${totalText}。Story deck for a serialized short narrative.\n\nOpening: ${firstLine}`),
    },
  ];

  return captions.sort((a, b) => (a.presetId === activePresetId ? -1 : b.presetId === activePresetId ? 1 : 0));
}

function createStoryDeck(markdown: string, preset: PlatformPreset, options: CardDeckSplitOptions): CardDeckSplitResult {
  const parsed = parseStorySegments(markdown);
  const sourceTitle = parsed.title || titleFromBlocks(parseSourceBlocks(markdown).blocks);
  const limits = getStoryCardLimits(preset);
  const deckNotes = ['Story deck split with short narrative pacing.'];
  const rawCards: Omit<CardDeckCard, 'id' | 'index'>[] = [];
  let currentSegments: StorySegment[] = [];

  const flushCard = () => {
    if (currentSegments.length === 0) {
      return;
    }

    const includeTitle = rawCards.length === 0;
    rawCards.push({
      title: sourceTitle,
      markdown: buildStoryCardMarkdown(sourceTitle, currentSegments, includeTitle),
      note: [`Story card for ${preset.label}.`, ...currentSegments.map((segment) => segment.note).filter(Boolean)].join(' '),
    });
    currentSegments.forEach((segment) => {
      if (segment.note) {
        addUnique(deckNotes, segment.note);
      }
    });
    currentSegments = [];
  };

  for (const rawSegment of parsed.segments) {
    if (rawSegment === 'break') {
      flushCard();
      continue;
    }

    for (const segment of fitStorySegmentToLimits(rawSegment, limits)) {
      const candidateSegments = [...currentSegments, segment];
      const includeTitle = rawCards.length === 0;
      const targetFits = storyCandidateFits(
        sourceTitle,
        candidateSegments,
        includeTitle,
        limits.characterLimit,
        limits.targetLineLimit,
      );
      const maxFits = storyCandidateFits(
        sourceTitle,
        candidateSegments,
        includeTitle,
        limits.characterLimit,
        limits.maxLineLimit,
      );

      if (
        currentSegments.length === 0 ||
        targetFits ||
        (maxFits && getMarkdownStats(segment.markdown).nonEmptyLineCount > 1)
      ) {
        currentSegments = candidateSegments;
      } else {
        flushCard();
        currentSegments = [segment];
      }
    }
  }

  flushCard();

  const maxCards = options.maxCards ?? Number.POSITIVE_INFINITY;
  const cards = rawCards.slice(0, maxCards).map((card, index) => ({
    ...card,
    id: `${deckIdFromTitle(sourceTitle)}-${String(index + 1).padStart(2, '0')}`,
    index,
  }));
  if (options.maxCards && rawCards.length > options.maxCards) {
    addUnique(deckNotes, `deck capped at ${options.maxCards} cards`);
  }

  if (cards.length === 0) {
    return {
      deck: null,
      note: 'No card-sized content was found in this Markdown.',
    };
  }

  const captions = createStoryCaptions(sourceTitle, cards, preset.id);
  const note = `Story deck created with ${cards.length} cards for ${preset.label}.`;

  return {
    deck: {
      id: deckIdFromTitle(sourceTitle),
      title: sourceTitle,
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

  if (detectNarrativeMarkdown(markdown)) {
    return createStoryDeck(markdown, preset, options);
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
