import { toBlob, toPng } from 'html-to-image';
import {
  defaultExportScaleId,
  getExportScaleOption,
  type ExportScaleOption,
  type PlatformPreset,
} from './cardOptions';

export function getExportFileName(preset: PlatformPreset, title: string): string {
  const baseName = title
    .replace(/^#+\s*/, '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);

  return `${baseName || 'md2cards'}-${preset.id}.png`;
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
    style: {
      width: `${preset.width}px`,
      height: `${preset.height}px`,
    },
  };
}

export async function downloadCard(
  node: HTMLElement,
  preset: PlatformPreset,
  title: string,
  exportScale?: ExportScaleOption,
): Promise<void> {
  const dataUrl = await toPng(node, getExportOptions(preset, exportScale));
  const link = document.createElement('a');
  link.download = getExportFileName(preset, title);
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

  const blob = await toBlob(node, getExportOptions(preset, exportScale));
  if (!blob) {
    throw new Error('Unable to render the card image.');
  }

  await navigator.clipboard.write([
    new ClipboardItem({
      [blob.type]: blob,
    }),
  ]);
}
