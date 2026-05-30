import { describe, expect, it } from 'vitest';
import {
  cardAccentOptions,
  cardBackgroundIntensityOptions,
  cardCompositionOptions,
  cardCornerRadiusOptions,
  cardDensityOptions,
  cardMoodOptions,
  cardShadowOptions,
  cardTextureOptions,
  cardTypographyVoiceOptions,
  cardTypographyScaleOptions,
  cardThemes,
  defaultCardCompositionId,
  defaultCardCornerRadiusId,
  defaultCardMoodId,
  defaultCardShadowId,
  defaultCardTextureId,
  defaultCardTypographyVoiceId,
  defaultCardTypographyScaleId,
  defaultExportScaleId,
  exportScaleOptions,
  applyStylePackAppearance,
  fitMarkdownToPreset,
  getCardBackgroundIntensityOption,
  getCardCompositionOption,
  getCardCornerRadiusOption,
  getCardMoodOption,
  getCardShadowOption,
  getCardTextureOption,
  getCardTypographyVoiceOption,
  getCardTypographyScaleOption,
  getExportPixelSize,
  getExportScaleOption,
  getMarkdownFitLimits,
  getMarkdownFitGuidance,
  getMarkdownStats,
  getPlatformFitHelper,
  getMarkdownTemplate,
  getRecipePreset,
  getSafeAreaGuide,
  getStarterMarkdown,
  getStylePack,
  markdownTemplates,
  onboardingWorkflowSteps,
  platformFitHelpers,
  platformPresets,
  recipePresets,
  sampleMarkdown,
  stylePacks,
  type RecipePresetId,
  type StylePackId,
  type TemplateId,
} from './cardOptions';

describe('onboardingWorkflowSteps', () => {
  it('keeps the first-run checklist focused on the path to export', () => {
    expect(onboardingWorkflowSteps.map((step) => step.id)).toEqual([
      'choose-start',
      'paste-markdown',
      'check-fit',
      'select-export',
      'export-card',
    ]);
    expect(onboardingWorkflowSteps.map((step) => step.label)).toEqual([
      'Pick template or Start Blank',
      'Paste or import Markdown',
      'Check length and safe area',
      'Choose platform/export quality',
      'Export PNG/SVG',
    ]);
  });

  it('provides concise helper text for every onboarding step', () => {
    expect(onboardingWorkflowSteps.every((step) => step.detail.length > 0)).toBe(true);
    expect(onboardingWorkflowSteps.every((step) => step.detail.length <= 85)).toBe(true);
  });
});

describe('markdownTemplates', () => {
  it('exposes unique starter templates with valid preset and theme defaults', () => {
    const templateIds = new Set(markdownTemplates.map((template) => template.id));
    const presetIds = new Set(platformPresets.map((preset) => preset.id));
    const themeIds = new Set(cardThemes.map((theme) => theme.id));

    expect(templateIds.size).toBe(markdownTemplates.length);
    expect(markdownTemplates).toHaveLength(3);
    expect(markdownTemplates.every((template) => presetIds.has(template.presetId))).toBe(true);
    expect(markdownTemplates.every((template) => themeIds.has(template.themeId))).toBe(true);
  });

  it('keeps the default sample aligned with the first starter', () => {
    expect(sampleMarkdown).toBe(markdownTemplates[0].markdown);
  });

  it('returns the active starter Markdown for clipboard helpers', () => {
    expect(getStarterMarkdown('github-release')).toBe(markdownTemplates[2].markdown);
  });

  it('falls back to the default starter for an unknown template id', () => {
    expect(getMarkdownTemplate('missing-template' as TemplateId)).toBe(markdownTemplates[0]);
  });
});

describe('cardThemes', () => {
  it('describes distinct design personalities for the theme controls', () => {
    expect(cardThemes.map((theme) => theme.id)).toEqual(['signal', 'paper', 'midnight', 'editorial']);
    expect(cardThemes.find((theme) => theme.id === 'signal')?.description).toContain('blueprint grid');
    expect(cardThemes.find((theme) => theme.id === 'paper')?.description).toContain('paper grain');
    expect(cardThemes.find((theme) => theme.id === 'midnight')?.description).toContain('terminal chrome');
    expect(cardThemes.find((theme) => theme.id === 'editorial')?.description).toContain('soft panels');
  });
});

describe('recipePresets', () => {
  it('exposes curated recipe presets with valid visual settings', () => {
    const recipeIds = new Set(recipePresets.map((recipePreset) => recipePreset.id));
    const presetIds = new Set(platformPresets.map((preset) => preset.id));
    const themeIds = new Set(cardThemes.map((theme) => theme.id));
    const densityIds = new Set(cardDensityOptions.map((option) => option.id));
    const typographyIds = new Set(cardTypographyScaleOptions.map((option) => option.id));
    const voiceIds = new Set(cardTypographyVoiceOptions.map((option) => option.id));
    const accentIds = new Set(cardAccentOptions.map((option) => option.id));
    const backgroundIntensityIds = new Set(cardBackgroundIntensityOptions.map((option) => option.id));
    const cornerRadiusIds = new Set(cardCornerRadiusOptions.map((option) => option.id));
    const compositionIds = new Set(cardCompositionOptions.map((option) => option.id));
    const textureIds = new Set(cardTextureOptions.map((option) => option.id));
    const moodIds = new Set(cardMoodOptions.map((option) => option.id));
    const shadowIds = new Set(cardShadowOptions.map((option) => option.id));

    expect(recipeIds.size).toBe(recipePresets.length);
    expect(recipePresets.map((recipePreset) => recipePreset.id)).toEqual([
      'launch',
      'before-after',
      'framework',
      'bugfix',
      'changelog',
      'tutorial',
      'insight',
      'quote',
      'code-snippet',
    ]);
    expect(recipePresets.every((recipePreset) => presetIds.has(recipePreset.presetId))).toBe(true);
    expect(recipePresets.every((recipePreset) => themeIds.has(recipePreset.themeId))).toBe(true);
    expect(recipePresets.every((recipePreset) => densityIds.has(recipePreset.cardDensityId))).toBe(true);
    expect(recipePresets.every((recipePreset) => typographyIds.has(recipePreset.cardTypographyScaleId))).toBe(true);
    expect(recipePresets.every((recipePreset) => voiceIds.has(recipePreset.cardTypographyVoiceId))).toBe(true);
    expect(recipePresets.every((recipePreset) => accentIds.has(recipePreset.cardAccentId))).toBe(true);
    expect(
      recipePresets.every((recipePreset) => backgroundIntensityIds.has(recipePreset.cardBackgroundIntensityId)),
    ).toBe(true);
    expect(recipePresets.every((recipePreset) => cornerRadiusIds.has(recipePreset.cardCornerRadiusId))).toBe(true);
    expect(recipePresets.every((recipePreset) => compositionIds.has(recipePreset.cardCompositionId))).toBe(true);
    expect(recipePresets.every((recipePreset) => textureIds.has(recipePreset.cardTextureId))).toBe(true);
    expect(recipePresets.every((recipePreset) => moodIds.has(recipePreset.cardMoodId))).toBe(true);
    expect(recipePresets.every((recipePreset) => shadowIds.has(recipePreset.cardShadowId))).toBe(true);
    expect(recipePresets.every((recipePreset) => recipePreset.markdown.trim().startsWith('#'))).toBe(true);
  });

  it('covers meaningfully different card setups, not just color swaps', () => {
    const visualSignatures = new Set(
      recipePresets.map((recipePreset) =>
        [
          recipePreset.presetId,
          recipePreset.themeId,
          recipePreset.cardDensityId,
          recipePreset.cardTypographyScaleId,
          recipePreset.cardTypographyVoiceId,
          recipePreset.cardAccentId,
          recipePreset.cardBackgroundIntensityId,
          recipePreset.cardCornerRadiusId,
          recipePreset.cardCompositionId,
          recipePreset.cardTextureId,
          recipePreset.cardMoodId,
          recipePreset.cardShadowId,
          recipePreset.showCardLabels,
        ].join('/'),
      ),
    );

    expect(visualSignatures.size).toBe(recipePresets.length);
    expect(new Set(recipePresets.map((recipePreset) => recipePreset.presetId)).size).toBeGreaterThanOrEqual(3);
    expect(new Set(recipePresets.map((recipePreset) => recipePreset.themeId)).size).toBeGreaterThanOrEqual(4);
    expect(new Set(recipePresets.map((recipePreset) => recipePreset.cardDensityId)).size).toBeGreaterThanOrEqual(3);
    expect(new Set(recipePresets.map((recipePreset) => recipePreset.cardTypographyScaleId)).size).toBeGreaterThanOrEqual(3);
    expect(new Set(recipePresets.map((recipePreset) => recipePreset.cardTypographyVoiceId)).size).toBeGreaterThanOrEqual(3);
    expect(new Set(recipePresets.map((recipePreset) => recipePreset.cardBackgroundIntensityId)).size).toBeGreaterThanOrEqual(3);
    expect(new Set(recipePresets.map((recipePreset) => recipePreset.cardCornerRadiusId)).size).toBeGreaterThanOrEqual(3);
    expect(new Set(recipePresets.map((recipePreset) => recipePreset.cardCompositionId)).size).toBeGreaterThanOrEqual(3);
    expect(new Set(recipePresets.map((recipePreset) => recipePreset.cardTextureId)).size).toBeGreaterThanOrEqual(3);
    expect(new Set(recipePresets.map((recipePreset) => recipePreset.cardMoodId)).size).toBeGreaterThanOrEqual(3);
    expect(new Set(recipePresets.map((recipePreset) => recipePreset.cardShadowId)).size).toBeGreaterThanOrEqual(3);
    expect(new Set(recipePresets.map((recipePreset) => recipePreset.showCardLabels)).size).toBe(2);
    expect(getRecipePreset('before-after')).toMatchObject({
      presetId: 'twitter',
      themeId: 'editorial',
      cardAccentId: 'emerald',
      cardBackgroundIntensityId: 'vivid',
      cardCompositionId: 'framed',
      cardTextureId: 'rich',
      cardMoodId: 'punchy',
      cardShadowId: 'dramatic',
      showCardLabels: false,
    });
    expect(getRecipePreset('framework')).toMatchObject({
      presetId: 'xiaohongshu',
      themeId: 'paper',
      cardCornerRadiusId: 'rounded',
      cardCompositionId: 'poster',
      cardTextureId: 'clean',
      cardMoodId: 'calm',
      cardShadowId: 'flat',
      showCardLabels: false,
    });
    expect(getRecipePreset('bugfix')).toMatchObject({
      presetId: 'launch',
      themeId: 'midnight',
      cardDensityId: 'compact',
      cardTypographyVoiceId: 'mono',
      cardAccentId: 'rose',
      cardMoodId: 'punchy',
      showCardLabels: true,
    });
    expect(getRecipePreset('before-after').markdown).toContain('| Before | After |');
    expect(getRecipePreset('framework').markdown).toContain('1. Outcome people want');
    expect(getRecipePreset('bugfix').markdown).toContain('Incident resolved');
    expect(getRecipePreset('quote').cardTypographyVoiceId).toBe('editorial');
    expect(getRecipePreset('code-snippet').cardTypographyVoiceId).toBe('mono');
    expect(getRecipePreset('code-snippet').cardCompositionId).toBe('code');
    expect(getRecipePreset('code-snippet').markdown).toContain('```tsx');
    expect(getStylePack('terminal-proof').cardCompositionId).toBe('code');
    expect(getRecipePreset('tutorial').markdown).toContain('1. Paste the Markdown draft');
    expect(getRecipePreset('quote').markdown).toContain('"Design tools');
  });

  it('falls back to the default recipe for an unknown recipe id', () => {
    expect(getRecipePreset('missing-recipe' as RecipePresetId)).toBe(recipePresets[0]);
  });
});

describe('stylePacks', () => {
  it('exposes unique appearance-only packs with valid option ids', () => {
    const stylePackIds = new Set(stylePacks.map((stylePack) => stylePack.id));
    const themeIds = new Set(cardThemes.map((theme) => theme.id));
    const densityIds = new Set(cardDensityOptions.map((option) => option.id));
    const typographyIds = new Set(cardTypographyScaleOptions.map((option) => option.id));
    const voiceIds = new Set(cardTypographyVoiceOptions.map((option) => option.id));
    const accentIds = new Set(cardAccentOptions.map((option) => option.id));
    const backgroundIntensityIds = new Set(cardBackgroundIntensityOptions.map((option) => option.id));
    const cornerRadiusIds = new Set(cardCornerRadiusOptions.map((option) => option.id));
    const compositionIds = new Set(cardCompositionOptions.map((option) => option.id));
    const textureIds = new Set(cardTextureOptions.map((option) => option.id));
    const moodIds = new Set(cardMoodOptions.map((option) => option.id));
    const shadowIds = new Set(cardShadowOptions.map((option) => option.id));

    expect(stylePacks).toHaveLength(5);
    expect(stylePackIds.size).toBe(stylePacks.length);
    expect(stylePacks.map((stylePack) => stylePack.id)).toEqual([
      'launch-glow',
      'editorial-note',
      'terminal-proof',
      'warm-quote',
      'clean-brief',
    ]);
    expect(stylePacks.every((stylePack) => themeIds.has(stylePack.themeId))).toBe(true);
    expect(stylePacks.every((stylePack) => densityIds.has(stylePack.cardDensityId))).toBe(true);
    expect(stylePacks.every((stylePack) => typographyIds.has(stylePack.cardTypographyScaleId))).toBe(true);
    expect(stylePacks.every((stylePack) => voiceIds.has(stylePack.cardTypographyVoiceId))).toBe(true);
    expect(stylePacks.every((stylePack) => accentIds.has(stylePack.cardAccentId))).toBe(true);
    expect(stylePacks.every((stylePack) => backgroundIntensityIds.has(stylePack.cardBackgroundIntensityId))).toBe(true);
    expect(stylePacks.every((stylePack) => cornerRadiusIds.has(stylePack.cardCornerRadiusId))).toBe(true);
    expect(stylePacks.every((stylePack) => compositionIds.has(stylePack.cardCompositionId))).toBe(true);
    expect(stylePacks.every((stylePack) => textureIds.has(stylePack.cardTextureId))).toBe(true);
    expect(stylePacks.every((stylePack) => moodIds.has(stylePack.cardMoodId))).toBe(true);
    expect(stylePacks.every((stylePack) => shadowIds.has(stylePack.cardShadowId))).toBe(true);
    expect(new Set(stylePacks.map((stylePack) => stylePack.cardMoodId)).size).toBeGreaterThanOrEqual(3);
    expect(new Set(stylePacks.map((stylePack) => stylePack.cardShadowId)).size).toBeGreaterThanOrEqual(3);
    expect(new Set(stylePacks.map((stylePack) => stylePack.showCardLabels)).size).toBe(2);
  });

  it('applies only appearance settings to an existing card config', () => {
    const config = {
      markdown: '# Keep my Markdown',
      presetId: 'xiaohongshu',
      exportScaleId: 'fast',
    };

    expect(applyStylePackAppearance(config, 'terminal-proof')).toEqual({
      markdown: '# Keep my Markdown',
      presetId: 'xiaohongshu',
      exportScaleId: 'fast',
      themeId: 'midnight',
      cardDensityId: 'compact',
      cardTypographyScaleId: 'small',
      cardTypographyVoiceId: 'mono',
      cardAccentId: 'emerald',
      cardBackgroundIntensityId: 'vivid',
      cardCornerRadiusId: 'sharp',
      cardCompositionId: 'code',
      cardTextureId: 'rich',
      cardMoodId: 'punchy',
      cardShadowId: 'dramatic',
      showCardLabels: true,
    });
  });

  it('falls back to the default style pack for an unknown style pack id', () => {
    expect(getStylePack('missing-pack' as StylePackId)).toBe(stylePacks[0]);
  });
});

describe('background intensity options', () => {
  it('exposes three readable background intensity levels with CSS classes', () => {
    expect(cardBackgroundIntensityOptions.map((option) => option.id)).toEqual(['soft', 'balanced', 'vivid']);
    expect(cardBackgroundIntensityOptions.map((option) => option.label)).toEqual(['Soft', 'Balanced', 'Vivid']);
    expect(cardBackgroundIntensityOptions.every((option) => option.className.startsWith('background-'))).toBe(true);
  });

  it('falls back to balanced background intensity for unknown ids', () => {
    expect(getCardBackgroundIntensityOption('missing' as never)).toMatchObject({
      id: 'balanced',
      label: 'Balanced',
      className: 'background-balanced',
    });
  });
});

describe('corner radius options', () => {
  it('defaults to sharp corners and exposes card classes', () => {
    expect(getCardCornerRadiusOption(defaultCardCornerRadiusId)).toMatchObject({
      id: 'sharp',
      className: 'radius-sharp',
    });
    expect(cardCornerRadiusOptions.map((option) => option.id)).toEqual(['sharp', 'subtle', 'rounded']);
    expect(cardCornerRadiusOptions.map((option) => option.className)).toEqual([
      'radius-sharp',
      'radius-subtle',
      'radius-rounded',
    ]);
  });

  it('falls back to sharp corners for unknown ids', () => {
    expect(getCardCornerRadiusOption('missing' as never)).toMatchObject({
      id: 'sharp',
      label: 'Sharp',
      className: 'radius-sharp',
    });
  });
});

describe('composition options', () => {
  it('defaults to the standard frame and exposes exported card classes', () => {
    expect(getCardCompositionOption(defaultCardCompositionId)).toMatchObject({
      id: 'standard',
      className: 'composition-standard',
    });
    expect(cardCompositionOptions.map((option) => option.id)).toEqual(['standard', 'framed', 'poster', 'code']);
    expect(cardCompositionOptions.map((option) => option.className)).toEqual([
      'composition-standard',
      'composition-framed',
      'composition-poster',
      'composition-code',
    ]);
    expect(getCardCompositionOption('code')).toMatchObject({
      label: 'Code Snippet',
      description: expect.stringContaining('fenced code blocks'),
    });
  });

  it('falls back to standard composition for unknown ids', () => {
    expect(getCardCompositionOption('missing' as never)).toMatchObject({
      id: 'standard',
      label: 'Standard',
      className: 'composition-standard',
    });
  });
});

describe('texture options', () => {
  it('defaults to subtle texture and exposes decorative depth classes', () => {
    expect(getCardTextureOption(defaultCardTextureId)).toMatchObject({
      id: 'subtle',
      className: 'texture-subtle',
    });
    expect(cardTextureOptions.map((option) => option.id)).toEqual(['clean', 'subtle', 'rich']);
    expect(cardTextureOptions.map((option) => option.className)).toEqual([
      'texture-clean',
      'texture-subtle',
      'texture-rich',
    ]);
  });

  it('falls back to subtle texture for unknown ids', () => {
    expect(getCardTextureOption('missing' as never)).toMatchObject({
      id: 'subtle',
      label: 'Subtle',
      className: 'texture-subtle',
    });
  });
});

describe('mood options', () => {
  it('defaults to calm mood and exposes exported card classes', () => {
    expect(getCardMoodOption(defaultCardMoodId)).toMatchObject({
      id: 'calm',
      className: 'mood-calm',
    });
    expect(cardMoodOptions.map((option) => option.id)).toEqual(['calm', 'punchy', 'premium']);
    expect(cardMoodOptions.map((option) => option.className)).toEqual([
      'mood-calm',
      'mood-punchy',
      'mood-premium',
    ]);
  });

  it('falls back to calm mood for unknown ids', () => {
    expect(getCardMoodOption('missing' as never)).toMatchObject({
      id: 'calm',
      label: 'Calm',
      className: 'mood-calm',
    });
  });
});

describe('shadow options', () => {
  it('defaults to lifted depth and exposes exported card classes', () => {
    expect(getCardShadowOption(defaultCardShadowId)).toMatchObject({
      id: 'lifted',
      className: 'shadow-lifted',
    });
    expect(cardShadowOptions.map((option) => option.id)).toEqual(['flat', 'lifted', 'dramatic']);
    expect(cardShadowOptions.map((option) => option.className)).toEqual([
      'shadow-flat',
      'shadow-lifted',
      'shadow-dramatic',
    ]);
  });

  it('falls back to lifted depth for unknown ids', () => {
    expect(getCardShadowOption('missing' as never)).toMatchObject({
      id: 'lifted',
      label: 'Lifted',
      className: 'shadow-lifted',
    });
  });
});

describe('markdown guidance', () => {
  it('provides paste-time platform fit guidance for every preset', () => {
    const helperPresetIds = new Set(platformFitHelpers.map((helper) => helper.presetId));

    expect(platformPresets.every((preset) => helperPresetIds.has(preset.id))).toBe(true);
    expect(getPlatformFitHelper(platformPresets[0])).toMatchObject({
      presetId: 'twitter',
      bestFor: expect.stringContaining('launch hook'),
      pasteTip: expect.stringContaining('caption'),
    });
    expect(getPlatformFitHelper(platformPresets[1])).toMatchObject({
      presetId: 'xiaohongshu',
      bestFor: expect.stringContaining('portrait checklist'),
      pasteTip: expect.stringContaining('wide tables'),
    });
    expect(getPlatformFitHelper(platformPresets[2])).toMatchObject({
      presetId: 'launch',
      bestFor: expect.stringContaining('release note'),
      pasteTip: expect.stringContaining('highlights'),
    });
  });

  it('counts trimmed Markdown content without treating whitespace as a card', () => {
    expect(getMarkdownStats('  \n\t ')).toEqual({
      characterCount: 0,
      lineCount: 0,
      nonEmptyLineCount: 0,
      headingCount: 0,
      isBlank: true,
    });

    expect(getMarkdownStats('# Launch\r\n\r\n- Fast\r\n- Crisp')).toMatchObject({
      characterCount: 24,
      lineCount: 4,
      nonEmptyLineCount: 3,
      headingCount: 1,
      isBlank: false,
    });
  });

  it('uses preset shape to choose practical Markdown fit guidance', () => {
    expect(getMarkdownFitGuidance('', platformPresets[0])).toMatchObject({
      tone: 'empty',
      lineLimit: 12,
      characterLimit: 820,
      summary: 'Paste your Markdown to start.',
      action: expect.stringContaining('caption'),
    });

    expect(getMarkdownFitGuidance('# Short update\n\n- One\n- Two', platformPresets[1])).toMatchObject({
      tone: 'ready',
      lineLimit: 16,
      characterLimit: 1120,
      summary: 'Good length for this card.',
      action: expect.stringContaining('portrait checklist'),
    });

    expect(getMarkdownFitGuidance(Array.from({ length: 14 }, (_, index) => `- Item ${index + 1}`).join('\n'), platformPresets[2])).toMatchObject({
      tone: 'dense',
      lineLimit: 13,
      characterLimit: 960,
      summary: 'This may feel crowded on export.',
      action: expect.stringContaining('Shorten long lists'),
    });
  });

  it('makes dense fit warnings actionable based on what is too long', () => {
    expect(getMarkdownFitGuidance(`One paragraph ${'with detail '.repeat(95)}`, platformPresets[0])).toMatchObject({
      tone: 'dense',
      action: expect.stringContaining('Tighten sentences'),
    });

    expect(getMarkdownFitGuidance(Array.from({ length: 30 }, (_, index) => `- Long item ${index + 1} ${'detail '.repeat(8)}`).join('\n'), platformPresets[1])).toMatchObject({
      tone: 'dense',
      action: expect.stringContaining('multiple cards'),
    });
  });

  it('leaves concise Markdown unchanged when fitting to a preset', () => {
    const markdown = '# Short update\n\n- One clear change\n- One proof point';
    const result = fitMarkdownToPreset(markdown, platformPresets[0]);

    expect(result).toMatchObject({
      markdown,
      changed: false,
      note: 'Already fits X / Twitter. No changes made.',
      changes: [],
    });
  });

  it('compacts pasted Markdown by normalizing spacing and capping list items', () => {
    const markdown = `# Launch note


- First key proof
- Second key proof
- Third key proof
- Fourth lower-priority detail
- Fifth lower-priority detail


More detail belongs in the caption.`;
    const result = fitMarkdownToPreset(markdown, platformPresets[0]);

    expect(result.changed).toBe(true);
    expect(result.note).toContain('normalized spacing');
    expect(result.note).toContain('capped lists at 3 items');
    expect(result.markdown).toContain('- First key proof');
    expect(result.markdown).toContain('- Third key proof');
    expect(result.markdown).not.toContain('Fourth lower-priority detail');
    expect(result.markdown).not.toContain('\n\n\n');
  });

  it('keeps indented list continuations attached when capping realistic mixed-language lists', () => {
    const markdown = [
      '# 发布清单',
      '',
      '- 第一条：中文 insight 先给结论，再解释 tradeoff。',
      '  Continuation detail should remain under the same bullet.',
      '  - Nested proof remains attached.',
      '- 第二条保留 bold **keyword** 和 English context.',
      '- 第三条保留链接 [issue](https://example.com/issues/42).',
      '- 第四条应该被 Twitter landscape 的列表上限移到 caption/source.',
    ].join('\n');
    const result = fitMarkdownToPreset(markdown, platformPresets[0]);

    expect(result.changed).toBe(true);
    expect(result.note).toContain('capped lists at 3 items');
    expect(result.markdown).toContain(
      [
        '- 第一条：中文 insight 先给结论，再解释 tradeoff。',
        '  Continuation detail should remain under the same bullet.',
        '  - Nested proof remains attached.',
      ].join('\n'),
    );
    expect(result.markdown).toContain('- 第三条保留链接 [issue](https://example.com/issues/42).');
    expect(result.markdown).not.toContain('第四条');
  });

  it('does not compact prose with pipe separators as table rows', () => {
    const markdown = [
      '# 双语复盘',
      '',
      '背景 | Background.',
      '问题 | Problem: `a | b` is prose.',
      '证据 | Evidence: [spec](https://e.co/s).',
      '处理 | Action.',
      '结果 | Result.',
    ].join('\n');
    const result = fitMarkdownToPreset(markdown, platformPresets[0]);

    expect(result.markdown).toContain('背景 | Background');
    expect(result.markdown).toContain('`a | b`');
    expect(result.markdown).toContain('[spec](https://e.co/s)');
    expect(result.markdown).toContain('处理 | Action');
    expect(result.markdown).toContain('结果 | Result');
    expect(result.note).not.toContain('table');
  });

  it('still caps real GFM tables using the table row limit', () => {
    const markdown = [
      '# Table check',
      '',
      '| 字段 | Field |',
      '| --- | --- |',
      '| 标题 | Title |',
      '| 摘要 | Summary |',
      '| 链接 | Link |',
    ].join('\n');
    const result = fitMarkdownToPreset(markdown, platformPresets[0]);

    expect(result.markdown).toContain('| 字段 | Field |');
    expect(result.markdown).toContain('| --- | --- |');
    expect(result.markdown).toContain('| 标题 | Title |');
    expect(result.markdown).toContain('| 摘要 | Summary |');
    expect(result.markdown).not.toContain('| 链接 | Link |');
    expect(result.note).toContain('kept the first 2 table rows');
  });

  it('keeps pipe characters inside inline code spans when fitting real GFM tables', () => {
    const markdown = [
      '# Table code check',
      '',
      '| Check | Detail |',
      '| --- | --- |',
      '| Parser | `value | fallback` stays in one cell. |',
      '| Export | Keep generated SVG text stable. |',
      '| Caption | This row should move back to the source. |',
    ].join('\n');
    const result = fitMarkdownToPreset(markdown, platformPresets[0]);

    expect(result.markdown).toContain('| Parser | `value | fallback` stays in one cell. |');
    expect(result.markdown).not.toContain('| Parser | `value | fallback` | stays in one cell. |');
    expect(result.markdown).not.toContain('| Caption |');
    expect(result.note).toContain('kept the first 2 table rows');
  });

  it('caps tilde-fenced code blocks without flattening them into prose', () => {
    const markdown = [
      '# Code check',
      '',
      '~~~tsx',
      'const title = "中文 launch";',
      'const cards = split(markdown);',
      'const first = cards[0];',
      'const second = cards[1];',
      'const third = cards[2];',
      '~~~',
    ].join('\n');
    const result = fitMarkdownToPreset(markdown, platformPresets[0]);

    expect(result.markdown).toContain('~~~tsx');
    expect(result.markdown).toContain('const second = cards[1];');
    expect(result.markdown).not.toContain('const third = cards[2];');
    expect(result.markdown).toContain('~~~');
    expect(result.note).toContain('kept the first 4 code lines');
  });

  it('closes unterminated fenced code blocks without dropping the pasted tail across presets', () => {
    const markdown = [
      '# CLI repro',
      '',
      '```bash',
      'npm test',
      'node scripts/check.js --preset=xiaohongshu',
      'echo "done 中文"',
    ].join('\n');

    for (const preset of platformPresets) {
      const result = fitMarkdownToPreset(markdown, preset);
      const limits = getMarkdownFitLimits(preset);
      const stats = getMarkdownStats(result.markdown);

      expect(result.changed).toBe(true);
      expect(result.note).toContain('closed an unterminated code fence');
      expect(result.markdown).toContain('echo "done 中文"');
      expect(result.markdown.endsWith('```')).toBe(true);
      expect(stats.nonEmptyLineCount).toBeLessThanOrEqual(limits.lineLimit);
      expect(stats.characterCount).toBeLessThanOrEqual(limits.characterLimit);
    }
  });

  it('shortens oversized single-line code blocks so fitted cards stay inside platform character limits', () => {
    const oversizedToken = `TOKEN_${'abcdef0123456789'.repeat(120)}`;
    const markdown = ['# CLI payload', '', '```bash', `curl https://example.com/deploy?payload=${oversizedToken}`, '```'].join(
      '\n',
    );

    for (const preset of platformPresets) {
      const result = fitMarkdownToPreset(markdown, preset);
      const limits = getMarkdownFitLimits(preset);
      const stats = getMarkdownStats(result.markdown);

      expect(result.changed).toBe(true);
      expect(result.note).toContain('shortened long code lines');
      expect(result.markdown).toContain('```bash');
      expect(result.markdown).toContain('curl https://example.com/deploy?payload=TOKEN_');
      expect(result.markdown).toContain('...');
      expect(result.markdown.endsWith('```')).toBe(true);
      expect(result.markdown).not.toContain(oversizedToken);
      expect(stats.nonEmptyLineCount).toBeLessThanOrEqual(limits.lineLimit);
      expect(stats.characterCount).toBeLessThanOrEqual(limits.characterLimit);
    }
  });

  it('keeps multi-line blockquotes as quote lines when fitting pasted Markdown', () => {
    const markdown = [
      '# Quote check',
      '',
      '> 第一行：中文反馈要保留原始语气。',
      '> 第二行：Mixed English, **emphasis**, and [links](https://example.com) should stay quoted.',
      '> 第三行：不要压平成普通段落。',
      '',
      'Follow-up belongs outside the quote.',
    ].join('\n');
    const result = fitMarkdownToPreset(markdown, platformPresets[1]);

    expect(result.markdown).toContain(
      [
        '> 第一行：中文反馈要保留原始语气。',
        '> 第二行：Mixed English, **emphasis**, and [links](https://example.com) should stay quoted.',
        '> 第三行：不要压平成普通段落。',
      ].join('\n'),
    );
    expect(result.markdown).not.toContain('语气。 > 第二行');
  });

  it('keeps tightly pasted paragraph-to-quote transitions as blockquotes', () => {
    const markdown = [
      '# 客户原话',
      '',
      'Context: this social post was pasted without a blank line before the quote.',
      '> 第一行：中文反馈要保留原始语气。',
      '> 第二行：Mixed English, **emphasis**, and [links](https://example.com) should stay quoted.',
      'Action: summarize the next step outside the quote.',
    ].join('\n');
    const result = fitMarkdownToPreset(markdown, platformPresets[1]);

    expect(result.markdown).toContain(
      [
        '> 第一行：中文反馈要保留原始语气。',
        '> 第二行：Mixed English, **emphasis**, and [links](https://example.com) should stay quoted.',
      ].join('\n'),
    );
    expect(result.markdown).toContain('Action: summarize the next step outside the quote.');
    expect(result.markdown).not.toContain('quote. > 第一行');
  });

  it('shortens long paragraphs and keeps the fitted result inside preset limits', () => {
    const markdown = `# Big update\n\n${'This release note has too much background detail for a social card. '.repeat(35)}`;
    const result = fitMarkdownToPreset(markdown, platformPresets[2]);
    const stats = getMarkdownStats(result.markdown);
    const limits = getMarkdownFitLimits(platformPresets[2]);

    expect(result.changed).toBe(true);
    expect(result.note).toContain('shortened long paragraphs');
    expect(result.markdown).toContain('...');
    expect(stats.nonEmptyLineCount).toBeLessThanOrEqual(limits.lineLimit);
    expect(stats.characterCount).toBeLessThanOrEqual(limits.characterLimit);
  });

  it('does not leave partial parenthesized Markdown links when shortening mixed-language paragraphs', () => {
    const completeLink =
      '[完整复盘](https://example.com/wiki/Card_(deck)_splitter?owner=fit&surface=xiaohongshu)';
    const markdown = [
      '# 括号链接压缩',
      '',
      `${'中文背景需要连续铺垫'.repeat(16)}${completeLink}${'后续继续补充 English context 和平台容量说明'.repeat(30)}。`,
    ].join('\n');
    const result = fitMarkdownToPreset(markdown, platformPresets[0]);
    const stats = getMarkdownStats(result.markdown);
    const limits = getMarkdownFitLimits(platformPresets[0]);

    expect(result.changed).toBe(true);
    expect(result.markdown).not.toContain('[完整复盘]');
    expect(result.markdown).not.toContain('example.com/wiki/Card_');
    expect(result.markdown).not.toMatch(/\[[^\]]+\]\([^)]*$/);
    expect(stats.nonEmptyLineCount).toBeLessThanOrEqual(limits.lineLimit);
    expect(stats.characterCount).toBeLessThanOrEqual(limits.characterLimit);
  });

  it('preserves the first heading while dropping later sections when over platform limits', () => {
    const markdown = [
      '# Primary headline',
      '',
      '## Important proof',
      '',
      ...Array.from({ length: 18 }, (_, index) => `Paragraph ${index + 1} ${'detail '.repeat(18)}`),
    ].join('\n\n');
    const result = fitMarkdownToPreset(markdown, platformPresets[0]);
    const stats = getMarkdownStats(result.markdown);

    expect(result.markdown.startsWith('# Primary headline')).toBe(true);
    expect(result.markdown).toContain('## Important proof');
    expect(result.note).toContain('kept content within 12 lines and 820 chars');
    expect(stats.nonEmptyLineCount).toBeLessThanOrEqual(12);
    expect(stats.characterCount).toBeLessThanOrEqual(820);
  });
});

describe('getSafeAreaGuide', () => {
  it('calculates approximate platform-safe margins from preset dimensions', () => {
    expect(getSafeAreaGuide(platformPresets[0])).toMatchObject({
      marginPercent: 10,
      horizontalMarginPercent: 10,
      verticalMarginPercent: 8,
      horizontalMargin: 160,
      verticalMargin: 72,
      contentWidth: 1280,
      contentHeight: 756,
      marginLabel: '~160px sides / ~72px top-bottom',
    });

    expect(getSafeAreaGuide(platformPresets[1])).toMatchObject({
      marginPercent: 8,
      horizontalMarginPercent: 8,
      verticalMarginPercent: 8,
      horizontalMargin: 86,
      verticalMargin: 115,
      contentWidth: 908,
      contentHeight: 1210,
      marginLabel: '~86px sides / ~115px top-bottom',
    });
  });

  it('uses the selected preset shape instead of a duplicated platform lookup', () => {
    expect(getSafeAreaGuide(platformPresets[2])).toMatchObject({
      marginPercent: 7.5,
      horizontalMarginPercent: 7.5,
      verticalMarginPercent: 7.5,
      horizontalMargin: 90,
      verticalMargin: 90,
      contentWidth: 1020,
      contentHeight: 1020,
      marginLabel: '~90px sides / ~90px top-bottom',
    });
  });
});

describe('exportScaleOptions', () => {
  it('defaults exports to crisp sharing', () => {
    expect(getExportScaleOption(defaultExportScaleId)).toMatchObject({
      id: 'crisp',
      scale: 2,
    });
  });

  it('calculates approximate output pixel dimensions from the selected scale', () => {
    expect(getExportPixelSize(platformPresets[1], exportScaleOptions[0])).toEqual({
      width: 1080,
      height: 1440,
    });
    expect(getExportPixelSize(platformPresets[1], exportScaleOptions[1])).toEqual({
      width: 2160,
      height: 2880,
    });
  });
});

describe('cardTypographyScaleOptions', () => {
  it('defaults to the current visual scale and exposes card classes', () => {
    expect(getCardTypographyScaleOption(defaultCardTypographyScaleId)).toMatchObject({
      id: 'default',
      className: 'type-default',
    });
    expect(cardTypographyScaleOptions.map((option) => option.className)).toEqual([
      'type-small',
      'type-default',
      'type-large',
    ]);
  });
});

describe('cardTypographyVoiceOptions', () => {
  it('defaults to the modern sans voice and exposes card classes', () => {
    expect(getCardTypographyVoiceOption(defaultCardTypographyVoiceId)).toMatchObject({
      id: 'modern',
      label: 'Modern Sans',
      className: 'voice-modern',
    });
    expect(cardTypographyVoiceOptions.map((option) => option.id)).toEqual(['modern', 'editorial', 'mono']);
    expect(cardTypographyVoiceOptions.map((option) => option.className)).toEqual([
      'voice-modern',
      'voice-editorial',
      'voice-mono',
    ]);
  });

  it('falls back to modern sans for unknown ids', () => {
    expect(getCardTypographyVoiceOption('missing' as never)).toMatchObject({
      id: 'modern',
      label: 'Modern Sans',
      className: 'voice-modern',
    });
  });
});
