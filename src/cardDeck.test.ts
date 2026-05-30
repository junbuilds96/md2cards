import { describe, expect, it } from 'vitest';
import { getMarkdownFitLimits, getMarkdownStats, platformPresets } from './cardOptions';
import { detectNarrativeMarkdown, splitMarkdownIntoCardDeck } from './cardDeck';

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

const narrativeStory = [
  '# 完美的分手',
  '',
  '雨停在晚上九点。',
  '',
  '林夏把钥匙放在玄关的瓷盘里，声音很轻，像怕吵醒一段已经睡着的关系。',
  '',
  '陈屿坐在餐桌旁，面前摆着两杯温水。',
  '',
  '“你还是来了。”他说。',
  '',
  '“我答应过今天把话说完。”',
  '',
  '> 她后来想，真正的告别不是摔门，是两个人都开始使用礼貌。',
  '',
  '他们之间隔着一张旧餐桌，也隔着七年的春夏秋冬。',
  '',
  '第一年，他们在凌晨的便利店分一只关东煮。',
  '',
  '第二年，他们搬进这间小屋，买了不配套的椅子。',
  '',
  '第三年，他们开始为谁洗碗沉默。',
  '',
  '第四年，他们学会把委屈咽下去。',
  '',
  '第五年，陈屿的项目越来越忙。',
  '',
  '第六年，林夏的画展越来越远。',
  '',
  '第七年，他们终于在同一个屋檐下变成了客人。',
  '',
  '---',
  '',
  '“你想好了吗？”陈屿问。',
  '',
  '林夏点头。',
  '',
  '“不是因为那次吵架。”她说，“也不是因为谁错得更多。”',
  '',
  '窗外有车灯扫过墙面，像一条短暂的河。',
  '',
  '陈屿低头看杯子。',
  '',
  '“那是因为什么？”',
  '',
  '“因为我们已经很努力地不伤害对方了。”',
  '',
  '这句话落下后，屋子安静得过分。',
  '',
  '他们都知道，努力不伤害，有时就是爱已经转身。',
  '',
  '> 陈屿第一次发现，原来体面也会疼。',
  '',
  '他笑了一下，没有成功。',
  '',
  '“我以为只要不提分开，就还能继续。”',
  '',
  '“我也这么以为。”林夏说。',
  '',
  '---',
  '',
  '他们开始分东西。',
  '',
  '书架上的小说归林夏。',
  '',
  '咖啡机归陈屿。',
  '',
  '那盆快死的薄荷没人要。',
  '',
  '“它一直是你浇的。”陈屿说。',
  '',
  '“但每次都是你把它搬到有太阳的地方。”',
  '',
  '于是薄荷被留在窗台，像最后一个不肯签字的证人。',
  '',
  '林夏把围巾叠进纸袋。',
  '',
  '陈屿把她落下的画册递过去。',
  '',
  '“这本你拿走吧。”',
  '',
  '“你不是说看不懂吗？”',
  '',
  '“后来懂了一点。”',
  '',
  '> 有些爱来得太慢，只能赶上离别。',
  '',
  '林夏接过画册，指尖碰到他的手。',
  '',
  '两个人都没有躲。',
  '',
  '---',
  '',
  '凌晨一点，门口只剩下一个行李箱。',
  '',
  '陈屿说：“我送你下楼。”',
  '',
  '“不用。”',
  '',
  '“那我看着你走。”',
  '',
  '林夏拉开门，又停住。',
  '',
  '“陈屿。”',
  '',
  '“嗯？”',
  '',
  '“以后别总把晚饭拖到十点。”',
  '',
  '他点头。',
  '',
  '“你也是，画完画记得关窗。”',
  '',
  '她笑了。',
  '',
  '这大概就是他们能给彼此的最后温柔。',
  '',
  '没有拥抱，没有眼泪，没有挽留。',
  '',
  '只有门轻轻合上。',
  '',
  '楼道的声控灯亮了一次，又暗下去。',
  '',
  '陈屿站在屋里，忽然听见雨重新落下。',
  '',
  '> 分手并不完美，完美的是他们终于没有把爱变成恨。',
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

  it('uses platform paragraph capacity when splitting a long paragraph', () => {
    const sentence =
      'This product note explains one practical change with enough detail to feel credible in the feed today. ';
    const markdown = `# Capacity check\n\n${sentence.repeat(90).trim()}`;
    const landscapePreset = platformPresets[0];
    const portraitPreset = platformPresets[1];
    const squarePreset = platformPresets[2];
    const landscapeLimits = getMarkdownFitLimits(landscapePreset);
    const portraitLimits = getMarkdownFitLimits(portraitPreset);
    const squareLimits = getMarkdownFitLimits(squarePreset);
    const landscapeDeck = splitMarkdownIntoCardDeck(markdown, landscapePreset).deck;
    const portraitDeck = splitMarkdownIntoCardDeck(markdown, portraitPreset).deck;
    const squareDeck = splitMarkdownIntoCardDeck(markdown, squarePreset).deck;

    expect(portraitLimits.paragraphCharacterLimit).toBeGreaterThan(squareLimits.paragraphCharacterLimit);
    expect(squareLimits.paragraphCharacterLimit).toBeGreaterThan(landscapeLimits.paragraphCharacterLimit);
    expect(portraitDeck?.cards.length).toBeLessThan(squareDeck?.cards.length ?? 0);
    expect(squareDeck?.cards.length).toBeLessThan(landscapeDeck?.cards.length ?? 0);

    for (const [deck, limits] of [
      [portraitDeck, portraitLimits],
      [squareDeck, squareLimits],
      [landscapeDeck, landscapeLimits],
    ] as const) {
      for (const card of deck?.cards ?? []) {
        const stats = getMarkdownStats(card.markdown);
        expect(stats.characterCount).toBeLessThanOrEqual(limits.characterLimit);
        expect(stats.nonEmptyLineCount).toBeLessThanOrEqual(limits.lineLimit);
      }
    }
  });

  it('does not split Markdown links across cards when long paragraphs contain URL punctuation', () => {
    const setupSentence =
      'This release note keeps enough setup context to move the next source sentence near a platform split point today.';
    const markdown = [
      '# Link capacity',
      '',
      [
        setupSentence,
        setupSentence,
        setupSentence,
        setupSentence,
        setupSentence,
        setupSentence,
        'Source: [capacity audit](https://example.com/docs/card.capacity?view=deck.splitter&owner=md2cards) confirms **deck splitting** remains stable.',
        'Follow-up: keep the caption short and leave the raw audit trail in the source Markdown.',
      ].join(' '),
    ].join('\n');

    const preset = platformPresets[0];
    const limits = getMarkdownFitLimits(preset);
    const result = splitMarkdownIntoCardDeck(markdown, preset);
    const linkCards = result.deck?.cards.filter((card) => card.markdown.includes('[capacity audit]')) ?? [];

    expect(result.deck?.cards.length).toBeGreaterThan(1);
    expect(linkCards).toHaveLength(1);
    expect(linkCards[0].markdown).toContain(
      '[capacity audit](https://example.com/docs/card.capacity?view=deck.splitter&owner=md2cards)',
    );
    expect(linkCards[0].markdown).toContain('**deck splitting**');
    for (const card of result.deck?.cards ?? []) {
      expect(card.markdown).not.toMatch(/\[[^\]]+\]\([^)]*$/);
      const stats = getMarkdownStats(card.markdown);
      expect(stats.characterCount).toBeLessThanOrEqual(limits.characterLimit);
      expect(stats.nonEmptyLineCount).toBeLessThanOrEqual(limits.lineLimit);
    }
  });

  it('keeps Chinese closing quote marks attached when splitting long mixed-language paragraphs', () => {
    const quotedSentence =
      '这段中文说明先铺垫上下文，确保段落会被拆成多张卡。“导出没有坏。”她说，“只是链接和中文标点要一起留下。”';
    const markdown = [
      '# 引号回归',
      '',
      '## 客户原话',
      '',
      Array.from({ length: 18 }, () => quotedSentence).join(' '),
    ].join('\n');

    const result = splitMarkdownIntoCardDeck(markdown, platformPresets[0]);
    const joinedCards = result.deck?.cards.map((card) => card.markdown).join('\n\n') ?? '';

    expect(result.deck?.cards.length).toBeGreaterThan(1);
    expect(joinedCards).toContain('“导出没有坏。”');
    expect(joinedCards).toContain('“只是链接和中文标点要一起留下。”');
    expect(result.deck?.cards.every((card) => !/\n\n[”」』）】》]/.test(card.markdown))).toBe(true);
    expect(joinedCards).not.toMatch(/“导出没有坏。(?!”)/u);
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

  it('uses Setext headings as deck title and section boundaries', () => {
    const markdown = [
      'Launch readiness memo',
      '=====================',
      '',
      'Risk review',
      '-----------',
      'Mixed Markdown imported from older docs should still split by the section heading.',
      '',
      'Caption checks',
      '--------------',
      'The generated caption should use the source title, not the first body paragraph.',
    ].join('\n');

    const result = splitMarkdownIntoCardDeck(markdown, platformPresets[2]);
    const joinedCards = result.deck?.cards.map((card) => card.markdown).join('\n\n') ?? '';

    expect(result.deck?.title).toBe('Launch readiness memo');
    expect(result.deck?.cards.map((card) => card.title)).toEqual(['Risk review', 'Caption checks']);
    expect(result.deck?.captionText).toContain('Launch readiness memo');
    expect(joinedCards).toContain('Mixed Markdown imported from older docs');
    expect(joinedCards).toContain('The generated caption should use the source title');
    expect(joinedCards).not.toContain('=====================');
    expect(joinedCards).not.toContain('--------------');
  });

  it('uses Markdown thematic breaks as deck card boundaries across platform presets', () => {
    const markdown = [
      '# Platform launch notes',
      '',
      'First card keeps the setup visible before the separator.',
      '',
      '***',
      '',
      'Second card keeps the proof point after a star break.',
      '',
      '_ _ _',
      '',
      'Third card keeps the CTA after a spaced underscore break.',
    ].join('\n');

    for (const preset of platformPresets) {
      const result = splitMarkdownIntoCardDeck(markdown, preset);
      const limits = getMarkdownFitLimits(preset);
      const joinedCards = result.deck?.cards.map((card) => card.markdown).join('\n\n') ?? '';

      expect(result.deck?.cards).toHaveLength(3);
      expect(joinedCards).toContain('First card keeps the setup');
      expect(joinedCards).toContain('Second card keeps the proof point');
      expect(joinedCards).toContain('Third card keeps the CTA');
      expect(joinedCards).not.toContain('***');
      expect(joinedCards).not.toContain('_ _ _');
      for (const card of result.deck?.cards ?? []) {
        const stats = getMarkdownStats(card.markdown);
        expect(stats.characterCount).toBeLessThanOrEqual(limits.characterLimit);
        expect(stats.nonEmptyLineCount).toBeLessThanOrEqual(limits.lineLimit);
      }
    }
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

  it('keeps nested list details with their parent item when splitting mixed-language outlines', () => {
    const preset = platformPresets[0];
    const markdown = [
      '# Mixed checklist',
      '',
      '## 发布前检查',
      '',
      '- 用户反馈：中文长段先给背景，再给动作。',
      '  这行补充 context in English，should stay under the same point.',
      '  - Nested proof keeps the caption claim close.',
      '- Mixed English/中文 line stays as the second top-level item.',
      '- Link proof: [issue 42](https://example.com/issues/42) is still visible.',
      '- Overflow detail belongs on the next card.',
    ].join('\n');

    const result = splitMarkdownIntoCardDeck(markdown, preset);
    const firstCardMarkdown = result.deck?.cards[0].markdown ?? '';

    expect(firstCardMarkdown).toContain(
      [
        '- 用户反馈：中文长段先给背景，再给动作。',
        '  这行补充 context in English，should stay under the same point.',
        '  - Nested proof keeps the caption claim close.',
      ].join('\n'),
    );
    expect(firstCardMarkdown).toContain('- Mixed English/中文 line stays as the second top-level item.');
    expect(firstCardMarkdown).toContain('- Link proof: [issue 42](https://example.com/issues/42) is still visible.');
    expect(firstCardMarkdown).not.toContain('- Overflow detail belongs on the next card.');
  });

  it('keeps nested ordered list cards inside each platform limit without dropping steps', () => {
    const sourceLines = [
      '1. Discovery',
      '   1. Map importer errors to the exact source line.',
      '   2. Keep fallback copy visible when metadata is missing.',
      '   3. Preserve the customer link for follow-up.',
      '2. Fix',
      '   1. Patch the parser in the smallest shared helper.',
      '   2. Keep the existing caption pipeline unchanged.',
      '   3. Add regression coverage before expanding scope.',
      '3. Verify',
      '   1. Run the deck splitter against every platform preset.',
      '   2. Confirm no generated card exceeds the line budget.',
      '   3. Check the caption still names the rollout checklist.',
      '4. Ship',
      '   1. Export the cards after the build passes.',
      '   2. Keep the source Markdown available for edits.',
      '   3. Note any intentionally capped detail in the deck notes.',
    ];
    const markdown = ['# Rollout checklist', '', ...sourceLines].join('\n');

    for (const preset of platformPresets) {
      const result = splitMarkdownIntoCardDeck(markdown, preset);
      const limits = getMarkdownFitLimits(preset);
      const joinedCards = result.deck?.cards.map((card) => card.markdown).join('\n\n') ?? '';

      expect(result.deck?.presetId).toBe(preset.id);
      expect(result.deck?.captionText).toContain('Rollout checklist');
      for (const card of result.deck?.cards ?? []) {
        const stats = getMarkdownStats(card.markdown);
        expect(stats.characterCount).toBeLessThanOrEqual(limits.characterLimit);
        expect(stats.nonEmptyLineCount).toBeLessThanOrEqual(limits.lineLimit);
      }
      for (const line of sourceLines) {
        expect(joinedCards).toContain(line);
      }
    }
  });

  it('splits oversized nested list items without overflowing platform card limits', () => {
    const nestedDetails = [
      '   - Paste from Notion keeps the incident summary visible.',
      '   - Preserve the bilingual owner note: 负责人 / owner.',
      '   - Keep the customer quote link [ticket 318](https://example.com/tickets/318).',
      '   - Include the reproduction step with `npm run build`.',
      '   - Capture the browser note for Safari export.',
      '   - Keep the Xiaohongshu caption warning attached.',
      '   - Include the launch-card safe-area reminder.',
      '   - Preserve the table fallback decision.',
      '   - Keep the CLI traceback summary.',
      '   - Include the screenshot alt text note.',
      '   - Preserve the rollback owner.',
      '   - Keep the QA checklist handoff.',
      '   - Include the release note paragraph.',
      '   - Preserve the support macro update.',
      '   - Keep the follow-up metric definition.',
      '   - Include the final publishing checkpoint.',
    ];
    const markdown = ['# Incident rollout', '', '1. Production validation', ...nestedDetails].join('\n');

    for (const preset of platformPresets) {
      const result = splitMarkdownIntoCardDeck(markdown, preset);
      const limits = getMarkdownFitLimits(preset);
      const joinedCards = result.deck?.cards.map((card) => card.markdown).join('\n\n') ?? '';

      expect(result.deck?.cards.length).toBeGreaterThan(1);
      expect(result.deck?.notes).toContain('split an oversized list item across cards');
      for (const card of result.deck?.cards ?? []) {
        const stats = getMarkdownStats(card.markdown);
        expect(stats.nonEmptyLineCount).toBeLessThanOrEqual(limits.lineLimit);
        expect(stats.characterCount).toBeLessThanOrEqual(limits.characterLimit);
      }
      expect(joinedCards).toContain('1. Production validation');
      for (const line of nestedDetails) {
        expect(joinedCards).toContain(line);
      }
    }
  });

  it('does not lose mixed-language prose that uses pipe separators instead of a table', () => {
    const preset = platformPresets[0];
    const markdown = [
      '# 双语复盘',
      '',
      '背景 | Background.',
      '问题 | Problem: `a | b` is prose.',
      '证据 | Evidence: [spec](https://e.co/s).',
      '处理 | Action.',
      '结果 | Result.',
    ].join('\n');

    const result = splitMarkdownIntoCardDeck(markdown, preset);
    const joinedCards = result.deck?.cards.map((card) => card.markdown).join('\n\n') ?? '';

    expect(joinedCards).toContain('背景 | Background');
    expect(joinedCards).toContain('`a | b`');
    expect(joinedCards).toContain('[spec](https://e.co/s)');
    expect(joinedCards).toContain('处理 | Action');
    expect(joinedCards).toContain('结果 | Result');
    expect(result.deck?.notes.some((note) => note.includes('table'))).toBe(false);
  });

  it('keeps wide mixed-language tables inside each platform limit without dropping the table', () => {
    const longEvidence =
      '[incident dashboard](https://example.com/incidents/2026/05/29/platform-capacity-regression-with-a-very-long-query-string?owner=card-splitting&surface=xiaohongshu) shows 中文字段 and English owner notes need a compact card-safe summary. ';
    const markdown = [
      '# Capacity table',
      '',
      '## 发布风险',
      '',
      '| 信号 | Evidence |',
      '| --- | --- |',
      `| 用户投诉 | ${longEvidence.repeat(4)} |`,
      `| 导出校验 | ${longEvidence.repeat(3)} |`,
      '| Caption | Keep the generated caption readable and move raw detail back to source. |',
    ].join('\n');

    for (const preset of platformPresets) {
      const result = splitMarkdownIntoCardDeck(markdown, preset);
      const limits = getMarkdownFitLimits(preset);
      const joinedCards = result.deck?.cards.map((card) => card.markdown).join('\n\n') ?? '';

      expect(joinedCards).toContain('| 信号 | Evidence |');
      expect(joinedCards).toContain('| 用户投诉 | incident dashboard');
      expect(joinedCards).not.toContain('https://example.com/incidents/2026/05/29');
      expect(result.deck?.cards.some((card) => card.note.includes('shortened wide table cells'))).toBe(true);
      for (const card of result.deck?.cards ?? []) {
        const stats = getMarkdownStats(card.markdown);
        expect(stats.characterCount).toBeLessThanOrEqual(limits.characterLimit);
        expect(stats.nonEmptyLineCount).toBeLessThanOrEqual(limits.lineLimit);
      }
    }
  });

  it('preserves tilde-fenced code blocks as code cards', () => {
    const markdown = [
      '# Code note',
      '',
      '## 修复步骤',
      '',
      'The implementation detail should stay readable beside 中文 context.',
      '',
      '~~~ts',
      'const title = "混合 Markdown";',
      'const lines = markdown.split("\\n");',
      'return lines.filter(Boolean);',
      '~~~',
      '',
      'Ship the caption after verifying the preview.',
    ].join('\n');
    const result = splitMarkdownIntoCardDeck(markdown, platformPresets[0]);
    const joinedCards = result.deck?.cards.map((card) => card.markdown).join('\n\n') ?? '';

    expect(joinedCards).toContain('~~~ts');
    expect(joinedCards).toContain('const title = "混合 Markdown";');
    expect(joinedCards).toContain('~~~');
    expect(result.deck?.notes.some((note) => note.includes('code'))).toBe(true);
  });

  it('keeps unterminated code fence tails in deck cards across platform presets', () => {
    const markdown = [
      '# CLI repro',
      '',
      '## Export check',
      '',
      '```bash',
      'npm test',
      'node scripts/check.js --preset=xiaohongshu',
      'echo "done 中文"',
    ].join('\n');

    for (const preset of platformPresets) {
      const result = splitMarkdownIntoCardDeck(markdown, preset);
      const limits = getMarkdownFitLimits(preset);
      const joinedCards = result.deck?.cards.map((card) => card.markdown).join('\n\n') ?? '';

      expect(joinedCards).toContain('```bash');
      expect(joinedCards).toContain('echo "done 中文"');
      expect(joinedCards).toContain('```');
      expect(result.deck?.notes).toContain('source contained code; closed an unterminated code fence');
      for (const card of result.deck?.cards ?? []) {
        const stats = getMarkdownStats(card.markdown);
        expect(stats.nonEmptyLineCount).toBeLessThanOrEqual(limits.lineLimit);
        expect(stats.characterCount).toBeLessThanOrEqual(limits.characterLimit);
      }
    }
  });

  it('preserves multi-line blockquotes in mixed-language social posts', () => {
    const markdown = [
      '# 客户反馈复盘',
      '',
      '## 原话摘录',
      '',
      'Before changing the onboarding copy, the quoted feedback should stay visibly quoted.',
      '',
      '> 第一行：我知道这个工具能把 Markdown 变成卡片。',
      '> 第二行：但我更想确认英文 links, **emphasis**, and context will not be flattened.',
      '> 第三行：发到小红书之前，我需要保留这段真实语气。',
      '',
      'Action: keep the quote shape, then summarize the next step.',
    ].join('\n');

    const result = splitMarkdownIntoCardDeck(markdown, platformPresets[1]);
    const joinedCards = result.deck?.cards.map((card) => card.markdown).join('\n\n') ?? '';

    expect(joinedCards).toContain(
      [
        '> 第一行：我知道这个工具能把 Markdown 变成卡片。',
        '> 第二行：但我更想确认英文 links, **emphasis**, and context will not be flattened.',
        '> 第三行：发到小红书之前，我需要保留这段真实语气。',
      ].join('\n'),
    );
    expect(joinedCards).not.toContain('卡片。 > 第二行');
  });

  it('keeps tightly pasted paragraph-to-quote transitions quoted in deck cards', () => {
    const markdown = [
      '# 客户反馈复盘',
      '',
      '## 原话摘录',
      '',
      'Context: pasted social drafts do not always include a blank line before quoted feedback.',
      '> 第一行：我知道这个工具能把 Markdown 变成卡片。',
      '> 第二行：但我更想确认英文 links, **emphasis**, and context will not be flattened.',
      'Action: keep the quote shape, then summarize the next step.',
    ].join('\n');

    const result = splitMarkdownIntoCardDeck(markdown, platformPresets[1]);
    const joinedCards = result.deck?.cards.map((card) => card.markdown).join('\n\n') ?? '';

    expect(joinedCards).toContain(
      [
        '> 第一行：我知道这个工具能把 Markdown 变成卡片。',
        '> 第二行：但我更想确认英文 links, **emphasis**, and context will not be flattened.',
      ].join('\n'),
    );
    expect(joinedCards).toContain('Action: keep the quote shape, then summarize the next step.');
    expect(joinedCards).not.toContain('feedback. > 第一行');
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

  it('keeps mixed-language inline Markdown readable in generated captions', () => {
    const markdown = [
      '# 发布复盘',
      '',
      '## 社交短帖',
      '',
      '中文长段：[路线图 Roadmap](https://example.com/roadmap) explains why **Markdown 卡片** and _English notes_ stay readable while export checks stay strict.',
      '',
      'Short post: ship the fix, keep the source, export safely.',
    ].join('\n');

    const result = splitMarkdownIntoCardDeck(markdown, platformPresets[2]);
    const joinedCards = result.deck?.cards.map((card) => card.markdown).join('\n\n') ?? '';
    const captionText = result.deck?.captions.map((caption) => caption.text).join('\n\n') ?? '';

    expect(joinedCards).toContain('[路线图 Roadmap](https://example.com/roadmap)');
    expect(captionText).toContain('路线图 Roadmap');
    expect(captionText).toContain('Markdown 卡片');
    expect(captionText).toContain('English notes');
    expect(captionText).not.toContain('https://example.com');
    expect(captionText).not.toContain('路线图 Roadmaphttps');
    expect(captionText).not.toContain('**');
    expect(captionText).not.toContain('_English');
  });

  it('uses story deck splitting for Chinese narrative markdown', () => {
    const result = splitMarkdownIntoCardDeck(narrativeStory, platformPresets[0]);
    const deck = result.deck;

    expect(detectNarrativeMarkdown(narrativeStory)).toBe(true);
    expect(deck).not.toBeNull();
    expect(deck?.cards.length).toBeGreaterThanOrEqual(16);

    const firstCardStats = getMarkdownStats(deck?.cards[0].markdown ?? '');
    expect(firstCardStats.nonEmptyLineCount).toBeLessThanOrEqual(7);
    expect(firstCardStats.characterCount).toBeLessThanOrEqual(420);
    for (const card of deck?.cards ?? []) {
      const stats = getMarkdownStats(card.markdown);
      expect(stats.nonEmptyLineCount).toBeLessThanOrEqual(7);
      expect(stats.characterCount).toBeLessThanOrEqual(420);
    }
    expect(deck?.cards.some((card) => card.markdown.includes('>'))).toBe(true);
    expect(deck?.cards.some((card) => card.markdown.includes('---'))).toBe(false);
    expect(deck?.note).toContain('Story deck');
    expect(deck?.cards.every((card) => card.note.includes('Story card'))).toBe(true);
    expect(deck?.captionText).toMatch(new RegExp(`共\\s*${deck?.cards.length}\\s*张卡`));
  });

  it('keeps multi-line narrative quotes readable without leaking quote markers into prose', () => {
    const markdown = [
      '# 雨夜回信',
      '',
      '雨从傍晚一直下到深夜，窗台上的旧信封被风吹得轻轻作响。',
      '',
      '林夏坐在灯下，把没有寄出的信重新读了一遍。',
      '',
      '“你后来还会想起那条路吗？”她问。',
      '',
      '> 第一行：我以为告别只是把门关上。',
      '> 第二行：后来才知道，真正难的是不再等一个脚步声。',
      '',
      '她把信折好，放回抽屉最深处。',
      '',
      '---',
      '',
      '第二天清晨，城市像被洗过一样安静。',
      '',
      '她走过便利店门口，看见热气从关东煮的锅里升起来。',
      '',
      '“原来生活会继续。”她对自己说。',
      '',
      '店员递来零钱，她忽然笑了一下。',
      '',
      '> 第一行：不是所有故事都需要答案。',
      '> 第二行：有些人留下的，是你终于学会独自走路。',
      '',
      '阳光落在站台边缘，像一封迟到很久的回信。',
      '',
      '她没有回头。',
    ].join('\n');

    const result = splitMarkdownIntoCardDeck(markdown, platformPresets[0]);
    const joinedCards = result.deck?.cards.map((card) => card.markdown).join('\n\n') ?? '';

    expect(detectNarrativeMarkdown(markdown)).toBe(true);
    expect(joinedCards).toContain('> 第一行：我以为告别只是把门关上。 第二行：后来才知道');
    expect(joinedCards).toContain('> 第一行：不是所有故事都需要答案。 第二行：有些人留下的');
    expect(joinedCards).not.toContain('> 第一行：我以为告别只是把门关上。 > 第二行');
    expect(joinedCards).not.toContain('> 第一行：不是所有故事都需要答案。 > 第二行');
  });
});
