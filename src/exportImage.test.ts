import { describe, expect, it } from 'vitest';
import { exportScaleOptions, platformPresets } from './cardOptions';
import {
  createSizedExportNode,
  getExportFileName,
  getExportHostStyle,
  getExportOptions,
  getSizedExportNodeStyle,
  getSvgExportOptions,
} from './exportImage';

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

function createFakeElement(tagName: string) {
  const element = {
    tagName,
    style: {} as Partial<CSSStyleDeclaration>,
    attributes: {} as Record<string, string>,
    children: [] as unknown[],
    removed: false,
    appendChild(child: unknown) {
      this.children.push(child);
      return child;
    },
    remove() {
      this.removed = true;
    },
    setAttribute(name: string, value: string) {
      this.attributes[name] = value;
    },
    cloneNode() {
      const clone = createFakeElement(`${tagName}-clone`);
      clone.ownerDocument = this.ownerDocument;
      return clone;
    },
    ownerDocument: undefined as unknown,
  };

  return element;
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
      canvasWidth: 1600,
      canvasHeight: 900,
    });
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
      canvasWidth: 1600,
      canvasHeight: 900,
    });
    expect(getHtmlToImageOutputSize(options)).toEqual({
      width: 3200,
      height: 1800,
    });
  });

  it('keeps the rendered node locked to the preset box', () => {
    expect(getSizedExportNodeStyle(platformPresets[1])).toMatchObject({
      width: '1080px',
      height: '1440px',
      minWidth: '1080px',
      maxWidth: '1080px',
      minHeight: '1440px',
      maxHeight: '1440px',
      aspectRatio: '1080 / 1440',
      margin: '0',
      transform: 'none',
    });
  });
});

describe('getSvgExportOptions', () => {
  it('uses the selected preset as the SVG viewport without PNG scaling', () => {
    const options = getSvgExportOptions(platformPresets[2]);

    expect(options).toMatchObject({
      width: 1200,
      height: 1200,
    });
    expect(options).not.toHaveProperty('pixelRatio');
    expect(options).not.toHaveProperty('canvasWidth');
    expect(options).not.toHaveProperty('canvasHeight');
  });
});

describe('getExportHostStyle', () => {
  it('places the temporary export host offscreen at the exact preset size', () => {
    expect(getExportHostStyle(platformPresets[0])).toMatchObject({
      position: 'fixed',
      left: '-100000px',
      top: '0',
      width: '1600px',
      height: '900px',
      overflow: 'hidden',
      pointerEvents: 'none',
    });
  });
});

describe('createSizedExportNode', () => {
  it('clones into an offscreen host and removes the host on cleanup', () => {
    const body = createFakeElement('body');
    const sourceNode = createFakeElement('article');
    const ownerDocument = {
      body,
      createElement: (tagName: string) => {
        const element = createFakeElement(tagName);
        element.ownerDocument = ownerDocument;
        return element;
      },
    };

    body.ownerDocument = ownerDocument;
    sourceNode.ownerDocument = ownerDocument;

    const exportNode = createSizedExportNode(sourceNode as unknown as HTMLElement, platformPresets[0]);
    const host = body.children[0] as ReturnType<typeof createFakeElement>;

    expect(body.children).toHaveLength(1);
    expect(host.children).toEqual([exportNode.node]);
    expect(host.style).toMatchObject({
      width: '1600px',
      height: '900px',
      overflow: 'hidden',
    });
    expect(exportNode.node.style).toMatchObject({
      width: '1600px',
      height: '900px',
      minWidth: '1600px',
      maxHeight: '900px',
    });
    expect((exportNode.node as unknown as ReturnType<typeof createFakeElement>).attributes).toMatchObject({
      'data-export-card': 'true',
    });

    exportNode.cleanup();

    expect(host.removed).toBe(true);
  });
});
