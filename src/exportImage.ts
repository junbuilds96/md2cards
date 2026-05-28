import { toBlob, toPng, toSvg } from 'html-to-image';
import {
  defaultExportScaleId,
  getExportScaleOption,
  type ExportScaleOption,
  type PlatformPreset,
} from './cardOptions';

export type ExportFileFormat = 'png' | 'svg';

type SizedExportNode = {
  node: HTMLElement;
  cleanup: () => void;
};

export function getExportFileName(
  preset: PlatformPreset,
  title: string,
  format: ExportFileFormat = 'png',
): string {
  const baseName = title
    .replace(/^#+\s*/, '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);

  return `${baseName || 'md2cards'}-${preset.id}.${format}`;
}

export function getSizedExportNodeStyle(preset: PlatformPreset): Partial<CSSStyleDeclaration> {
  const width = `${preset.width}px`;
  const height = `${preset.height}px`;

  return {
    width,
    height,
    minWidth: width,
    maxWidth: width,
    minHeight: height,
    maxHeight: height,
    aspectRatio: `${preset.width} / ${preset.height}`,
    margin: '0',
    transform: 'none',
  };
}

export function getExportHostStyle(preset: PlatformPreset): Partial<CSSStyleDeclaration> {
  return {
    position: 'fixed',
    left: '-100000px',
    top: '0',
    width: `${preset.width}px`,
    height: `${preset.height}px`,
    overflow: 'hidden',
    pointerEvents: 'none',
    zIndex: '-1',
  };
}

export function getExportOptions(
  preset: PlatformPreset,
  exportScale: ExportScaleOption = getExportScaleOption(defaultExportScaleId),
) {
  return {
    cacheBust: true,
    pixelRatio: exportScale.scale,
    width: preset.width,
    height: preset.height,
    canvasWidth: preset.width,
    canvasHeight: preset.height,
    style: {
      width: `${preset.width}px`,
      height: `${preset.height}px`,
      minWidth: `${preset.width}px`,
      maxWidth: `${preset.width}px`,
      minHeight: `${preset.height}px`,
      maxHeight: `${preset.height}px`,
      margin: '0',
      transform: 'none',
    },
  };
}

export function getSvgExportOptions(preset: PlatformPreset) {
  return {
    cacheBust: true,
    width: preset.width,
    height: preset.height,
    style: getSizedExportNodeStyle(preset),
  };
}

export function createSizedExportNode(sourceNode: HTMLElement, preset: PlatformPreset): SizedExportNode {
  const ownerDocument = sourceNode.ownerDocument;
  const host = ownerDocument.createElement('div');
  const exportNode = sourceNode.cloneNode(true) as HTMLElement;

  Object.assign(host.style, getExportHostStyle(preset));
  Object.assign(exportNode.style, getSizedExportNodeStyle(preset));
  exportNode.setAttribute('data-export-card', 'true');

  host.appendChild(exportNode);
  ownerDocument.body.appendChild(host);

  return {
    node: exportNode,
    cleanup: () => {
      host.remove();
    },
  };
}

async function withSizedExportNode<T>(
  node: HTMLElement,
  preset: PlatformPreset,
  render: (exportNode: HTMLElement) => Promise<T>,
): Promise<T> {
  const exportNode = createSizedExportNode(node, preset);

  try {
    return await render(exportNode.node);
  } finally {
    exportNode.cleanup();
  }
}

export async function downloadCard(
  node: HTMLElement,
  preset: PlatformPreset,
  title: string,
  exportScale?: ExportScaleOption,
): Promise<void> {
  const dataUrl = await withSizedExportNode(node, preset, (exportNode) =>
    toPng(exportNode, getExportOptions(preset, exportScale)),
  );
  const link = document.createElement('a');
  link.download = getExportFileName(preset, title);
  link.href = dataUrl;
  link.click();
}

export async function downloadSvgCard(
  node: HTMLElement,
  preset: PlatformPreset,
  title: string,
  exportScale?: ExportScaleOption,
): Promise<void> {
  void exportScale;
  const dataUrl = await withSizedExportNode(node, preset, (exportNode) =>
    toSvg(exportNode, getSvgExportOptions(preset)),
  );
  const link = document.createElement('a');
  link.download = getExportFileName(preset, title, 'svg');
  link.href = dataUrl;
  link.click();
}

export async function copyCard(
  node: HTMLElement,
  preset: PlatformPreset,
  exportScale?: ExportScaleOption,
): Promise<void> {
  if (!('ClipboardItem' in window) || !navigator.clipboard?.write) {
    throw new Error('Image clipboard support is not available in this browser.');
  }

  const blob = await withSizedExportNode(node, preset, (exportNode) =>
    toBlob(exportNode, getExportOptions(preset, exportScale)),
  );
  if (!blob) {
    throw new Error('Unable to render the card image.');
  }

  await navigator.clipboard.write([
    new ClipboardItem({
      [blob.type]: blob,
    }),
  ]);
}
