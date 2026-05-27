import { describe, expect, it } from 'vitest';
import {
  cardThemes,
  defaultExportScaleId,
  exportScaleOptions,
  getExportPixelSize,
  getExportScaleOption,
  getMarkdownTemplate,
  getSafeAreaGuide,
  getStarterMarkdown,
  markdownTemplates,
  platformPresets,
  sampleMarkdown,
  type TemplateId,
} from './cardOptions';

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
