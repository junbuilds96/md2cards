import { toBlob, toPng, toSvg } from 'html-to-image';
import JSZip from 'jszip';
import {
  defaultExportScaleId,
  getExportScaleOption,
  type ExportScaleOption,
  type PlatformPreset,
} from './cardOptions';

export type ExportFileFormat = 'png' | 'svg';

export type SvgDeckFile = {
  fileName: string;
  svg: string;
};

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

function slugifyExportTitle(title: string): string {
  return title
    .replace(/^#+\s*/, '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
}

export function getDeckExportFileName(title: string, index: number, format: ExportFileFormat = 'svg'): string {
  const baseName = slugifyExportTitle(title) || 'md2cards';

  return `${baseName}-${String(index + 1).padStart(2, '0')}.${format}`;
}

export function getDeckZipFileName(title: string): string {
  const baseName = slugifyExportTitle(title) || 'md2cards';

  return `${baseName}-deck.zip`;
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

export async function renderCardToSvgDataUrl(node: HTMLElement, preset: PlatformPreset): Promise<string> {
  return withSizedExportNode(node, preset, (exportNode) => toSvg(exportNode, getSvgExportOptions(preset)));
}

function svgFromDataUrl(svg: string): string {
  if (!svg.startsWith('data:image/svg+xml')) {
    return svg;
  }

  const [, payload = ''] = svg.split(',', 2);

  if (svg.includes(';base64,')) {
    return atob(payload);
  }

  return decodeURIComponent(payload);
}

export async function createSvgDeckZip(files: SvgDeckFile[]): Promise<Blob> {
  const zip = new JSZip();

  for (const file of files) {
    zip.file(file.fileName, svgFromDataUrl(file.svg));
  }

  const bytes = await zip.generateAsync({
    type: 'uint8array',
  });
  const buffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buffer).set(bytes);

  return new Blob([buffer], { type: 'application/zip' });
}

export async function downloadSvgDeckZip(files: SvgDeckFile[], title: string): Promise<void> {
  const blob = await createSvgDeckZip(files);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.download = getDeckZipFileName(title);
  link.href = url;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
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
