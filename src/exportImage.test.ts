import { describe, expect, it } from 'vitest';
import { exportScaleOptions, platformPresets } from './cardOptions';
import { getExportFileName, getExportOptions } from './exportImage';

type HtmlToImageSizeOptions = ReturnType<typeof getExportOptions> & {
  canvasWidth?: number;
  canvasHeight?: number;
};

function getHtmlToImageOutputSize(options: HtmlToImageSizeOptions) {
  return {
    width: Math.round((options.canvasWidth ?? options.width ?? 0) * (options.pixelRatio ?? 1)),
    height: Math.round((options.canvasHeight ?? options.height ?? 0) * (options.pixelRatio ?? 1)),
  };
}

describe('getExportFileName', () => {
  it('creates a stable social-card filename from a markdown title', () => {
    expect(getExportFileName(platformPresets[0], '# Launch: MD2Cards v0.1!')).toBe(
      'launch-md2cards-v0-1-twitter.png',
    );
  });

  it('creates an SVG filename from the same title and platform preset', () => {
    expect(getExportFileName(platformPresets[1], '# Launch: MD2Cards v0.1!', 'svg')).toBe(
      'launch-md2cards-v0-1-xiaohongshu.svg',
    );
  });

  it('falls back when the title has no usable characters', () => {
    expect(getExportFileName(platformPresets[2], '### ✨')).toBe('md2cards-launch.png');
  });
});

describe('getExportOptions', () => {
  it('uses pixelRatio as the only export scaling multiplier', () => {
    const fastPreview = exportScaleOptions[0];
    const options = getExportOptions(platformPresets[0], fastPreview);

    expect(options).toMatchObject({
      pixelRatio: 1,
      width: 1600,
      height: 900,
    });
    expect(options).not.toHaveProperty('canvasWidth');
    expect(options).not.toHaveProperty('canvasHeight');
    expect(getHtmlToImageOutputSize(options)).toEqual({
      width: 1600,
      height: 900,
    });
  });

  it('defaults to crisp share output without multiplying canvas dimensions twice', () => {
    const options = getExportOptions(platformPresets[0]);

    expect(options).toMatchObject({
      pixelRatio: 2,
      width: 1600,
      height: 900,
    });
    expect(options).not.toHaveProperty('canvasWidth');
    expect(options).not.toHaveProperty('canvasHeight');
    expect(getHtmlToImageOutputSize(options)).toEqual({
      width: 3200,
      height: 1800,
    });
  });
});
