import { describe, expect, it } from 'vitest';
import {
  cardAccentOptions,
  cardBackgroundIntensityOptions,
  cardCornerRadiusOptions,
  cardDensityOptions,
  cardTextureOptions,
  cardTypographyScaleOptions,
  cardThemes,
  defaultCardCornerRadiusId,
  defaultCardTextureId,
  defaultCardTypographyScaleId,
  defaultExportScaleId,
  exportScaleOptions,
  fitMarkdownToPreset,
  getCardBackgroundIntensityOption,
  getCardCornerRadiusOption,
  getCardTextureOption,
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
  markdownTemplates,
  onboardingWorkflowSteps,
  platformFitHelpers,
  platformPresets,
  recipePresets,
  sampleMarkdown,
  type RecipePresetId,
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
    const accentIds = new Set(cardAccentOptions.map((option) => option.id));
    const backgroundIntensityIds = new Set(cardBackgroundIntensityOptions.map((option) => option.id));
    const cornerRadiusIds = new Set(cardCornerRadiusOptions.map((option) => option.id));
    const textureIds = new Set(cardTextureOptions.map((option) => option.id));

    expect(recipeIds.size).toBe(recipePresets.length);
    expect(recipePresets.map((recipePreset) => recipePreset.id)).toEqual([
      'launch',
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
    expect(recipePresets.every((recipePreset) => accentIds.has(recipePreset.cardAccentId))).toBe(true);
    expect(
      recipePresets.every((recipePreset) => backgroundIntensityIds.has(recipePreset.cardBackgroundIntensityId)),
    ).toBe(true);
    expect(recipePresets.every((recipePreset) => cornerRadiusIds.has(recipePreset.cardCornerRadiusId))).toBe(true);
    expect(recipePresets.every((recipePreset) => textureIds.has(recipePreset.cardTextureId))).toBe(true);
    expect(recipePresets.every((recipePreset) => recipePreset.markdown.trim().startsWith('#'))).toBe(true);
  });

  it('covers meaningfully different card setups, not just color swaps', () => {
    expect(new Set(recipePresets.map((recipePreset) => recipePreset.presetId)).size).toBeGreaterThanOrEqual(3);
    expect(new Set(recipePresets.map((recipePreset) => recipePreset.themeId)).size).toBeGreaterThanOrEqual(4);
    expect(new Set(recipePresets.map((recipePreset) => recipePreset.cardDensityId)).size).toBeGreaterThanOrEqual(3);
    expect(new Set(recipePresets.map((recipePreset) => recipePreset.cardTypographyScaleId)).size).toBeGreaterThanOrEqual(3);
    expect(new Set(recipePresets.map((recipePreset) => recipePreset.cardBackgroundIntensityId)).size).toBeGreaterThanOrEqual(3);
    expect(new Set(recipePresets.map((recipePreset) => recipePreset.cardCornerRadiusId)).size).toBeGreaterThanOrEqual(3);
    expect(new Set(recipePresets.map((recipePreset) => recipePreset.cardTextureId)).size).toBeGreaterThanOrEqual(3);
    expect(new Set(recipePresets.map((recipePreset) => recipePreset.showCardLabels)).size).toBe(2);
    expect(getRecipePreset('code-snippet').markdown).toContain('```bash');
    expect(getRecipePreset('tutorial').markdown).toContain('1. Paste the Markdown draft');
    expect(getRecipePreset('quote').markdown).toContain('"Design tools');
  });

  it('falls back to the default recipe for an unknown recipe id', () => {
    expect(getRecipePreset('missing-recipe' as RecipePresetId)).toBe(recipePresets[0]);
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
      characterLimit: 900,
      summary: 'Paste your Markdown to start.',
      action: expect.stringContaining('caption'),
    });

    expect(getMarkdownFitGuidance('# Short update\n\n- One\n- Two', platformPresets[1])).toMatchObject({
      tone: 'ready',
      lineLimit: 16,
      characterLimit: 1100,
      summary: 'Good length for this card.',
      action: expect.stringContaining('portrait checklist'),
    });

    expect(getMarkdownFitGuidance(Array.from({ length: 14 }, (_, index) => `- Item ${index + 1}`).join('\n'), platformPresets[2])).toMatchObject({
      tone: 'dense',
      lineLimit: 13,
      characterLimit: 950,
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
    expect(result.note).toContain('kept content within 12 lines and 900 chars');
    expect(stats.nonEmptyLineCount).toBeLessThanOrEqual(12);
    expect(stats.characterCount).toBeLessThanOrEqual(900);
  });
});

describe('getSafeAreaGuide', () => {
  it('calculates approximate platform-safe margins from preset dimensions', () => {
    expect(getSafeAreaGuide(platformPresets[0])).toMatchObject({
      marginPercent: 7,
      horizontalMargin: 112,
      verticalMargin: 63,
      contentWidth: 1376,
      contentHeight: 774,
      marginLabel: '~112px sides / ~63px top-bottom',
    });

    expect(getSafeAreaGuide(platformPresets[1])).toMatchObject({
      marginPercent: 8,
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
