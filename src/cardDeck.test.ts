import { describe, expect, it } from 'vitest';
import { getMarkdownFitLimits, getMarkdownStats, platformPresets } from './cardOptions';
import { splitMarkdownIntoCardDeck } from './cardDeck';

const longEssay = [
  '# Long-form launch notes',
  '',
  'This release changes how teams turn raw notes into share-ready updates. The first change is a safer editing flow that keeps the original notes intact while a fitted card preview updates separately. The second change is a publishing workflow that treats captions as part of the output instead of an afterthought. The third change is a deck flow for essays that need more than one card.',
  '',
  '## Problem',
  '',
  'People often paste a full essay into one card because the editor accepts it. That creates tiny text, weak hierarchy, and exports that look acceptable in the browser but fail in the feed. A better product path should preserve the long source, split it into platform-safe cards, and keep the narrative order.',
  '',
  '## Solution',
  '',
  'The splitter should follow headings first, then paragraphs, then sentence boundaries. Each card should stay inside platform limits and report when code, tables, or unavoidable truncation affected the card. Captions should summarize the full deck so the text still has a place to live.',
  '',
  '## Rollout',
  '',
  'Creators can split the draft, preview card by card, copy the generated caption, and export the deck. The source remains editable so the workflow is reversible.',
].join('\n');

describe('splitMarkdownIntoCardDeck', () => {
  it('does not create a deck for empty Markdown and returns a clear note', () => {
    const result = splitMarkdownIntoCardDeck('  \n\t ', platformPresets[0]);

    expect(result.deck).toBeNull();
    expect(result.note).toContain('Paste Markdown');
  });

  it('splits a long essay into multiple fitted cards', () => {
    const result = splitMarkdownIntoCardDeck(longEssay, platformPresets[0]);
    const limits = getMarkdownFitLimits(platformPresets[0]);

    expect(result.deck?.cards.length).toBeGreaterThan(1);
    expect(result.deck?.title).toBe('Long-form launch notes');

    for (const card of result.deck?.cards ?? []) {
      const stats = getMarkdownStats(card.markdown);
      expect(stats.characterCount).toBeLessThanOrEqual(limits.characterLimit);
      expect(stats.nonEmptyLineCount).toBeLessThanOrEqual(limits.lineLimit);
    }
  });

  it('preserves H2/H3 order as card titles', () => {
    const markdown = [
      '# Source title',
      '',
      '## First section',
      'First details.',
      '',
      '### Second section',
      'Second details.',
      '',
      '## Third section',
      'Third details.',
    ].join('\n');

    const result = splitMarkdownIntoCardDeck(markdown, platformPresets[2]);

    expect(result.deck?.cards.map((card) => card.title)).toEqual([
      'First section',
      'Second section',
      'Third section',
    ]);
  });

  it('groups continuous bullet lists by the preset bulletLimit', () => {
    const preset = platformPresets[0];
    const limits = getMarkdownFitLimits(preset);
    const markdown = [
      '# Bullet deck',
      '',
      ...Array.from({ length: limits.bulletLimit * 2 + 1 }, (_, index) => `- Item ${index + 1}`),
    ].join('\n');

    const result = splitMarkdownIntoCardDeck(markdown, preset);

    expect(result.deck?.cards).toHaveLength(3);
    expect(result.deck?.cards[0].markdown).toContain('- Item 1');
    expect(result.deck?.cards[0].markdown).toContain(`- Item ${limits.bulletLimit}`);
    expect(result.deck?.cards[0].markdown).not.toContain(`- Item ${limits.bulletLimit + 1}`);
    expect(result.deck?.cards[2].markdown).toContain(`- Item ${limits.bulletLimit * 2 + 1}`);
  });

  it('creates different deterministic captions for each platform', () => {
    const twitter = splitMarkdownIntoCardDeck(longEssay, platformPresets[0]).deck?.captionText ?? '';
    const xiaohongshu = splitMarkdownIntoCardDeck(longEssay, platformPresets[1]).deck?.captionText ?? '';
    const launch = splitMarkdownIntoCardDeck(longEssay, platformPresets[2]).deck?.captionText ?? '';

    expect(twitter).toContain('Thread');
    expect(twitter).toContain('Full notes in source');
    expect(xiaohongshu).toContain('收藏');
    expect(xiaohongshu).toContain('评论');
    expect(launch).toContain('Highlights');
    expect(launch).toContain('Repo/update');
    expect(new Set([twitter, xiaohongshu, launch]).size).toBe(3);
  });
});
