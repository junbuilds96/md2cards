import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const styles = readFileSync(resolve(dirname(fileURLToPath(import.meta.url)), 'styles.css'), 'utf8');

function getRule(selector: string): string {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = styles.match(new RegExp(`${escapedSelector}\\s*\\{([^}]*)\\}`));

  return match?.[1] ?? '';
}

function getRuleContaining(selector: string, declaration: string): string {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const matches = [...styles.matchAll(new RegExp(`${escapedSelector}\\s*\\{([^}]*)\\}`, 'g'))];

  return matches.find((match) => match[1]?.includes(declaration))?.[1] ?? '';
}

describe('clean social card CSS', () => {
  it('uses compact in-card spacing when labels are hidden', () => {
    const cardRule = getRule('.social-card');
    const bodyRule = getRule('.social-card.card-labels-hidden .markdown-card-body');
    const h1Rule = getRule('.social-card.card-labels-hidden .markdown-card-body h1');
    const tableCellRule = getRule(
      '.social-card.card-labels-hidden .markdown-card-body th,\n.social-card.card-labels-hidden .markdown-card-body td',
    );

    expect(cardRule).toContain('--card-clean-body-padding-block: clamp(30px, 6cqh, 60px)');
    expect(cardRule).toContain('--card-clean-h1-font-size: clamp(32px, 6cqw, 96px)');
    expect(bodyRule).toContain('justify-content: flex-start');
    expect(bodyRule).toContain('padding-block: var(--card-clean-body-padding-block)');
    expect(h1Rule).toContain('font-size: var(--card-clean-h1-font-size)');
    expect(tableCellRule).toContain('font-size: var(--card-clean-table-cell-font-size)');
  });

  it('keeps markdown children and h2 from collapsing into clipped fragments', () => {
    const childRule = getRule('.social-card.card-labels-hidden .markdown-card-body > *');
    const h2Rule = getRule('.social-card.card-labels-hidden .markdown-card-body h2');

    expect(childRule).toContain('flex-shrink: 0');
    expect(h2Rule).toContain('font-size: var(--card-clean-h2-font-size)');
    expect(h2Rule).not.toMatch(/(?:^|[;\s])(?:height|max-height)\s*:\s*0/);
  });

  it('keeps spacious launch samples constrained while preserving visible density differences', () => {
    const cardRule = getRule('.social-card');
    const spaciousRule = getRule('.social-card.density-spacious');

    expect(cardRule).toContain('--card-body-inline-padding: 5.5cqw');
    expect(spaciousRule).toContain('--card-body-inline-padding: 6.5cqw');
    expect(spaciousRule).toContain('--card-chrome-padding-block: clamp(28px, 4.8cqh, 48px)');
    expect(spaciousRule).toContain('--card-h1-font-size: clamp(28px, 5.2cqw, 82px)');
    expect(spaciousRule).toContain('--card-body-font-size: clamp(14px, 1.8cqw, 29px)');
    expect(spaciousRule).toContain('--card-body-line-height: 1.17');
    expect(spaciousRule).toContain('--card-table-cell-padding: clamp(4px, 0.8cqh, 7px) clamp(8px, 0.9cqw, 14px)');
  });

  it('keeps the preview toolbar compact and grouped', () => {
    const toolbarRule = getRule('.preview-toolbar');
    const controlsRule = getRule('.preview-controls');
    const togglesRule = getRule('.preview-toggles');
    const guideToggleRule = getRule('.guide-toggle');
    const toggleBoxRule = getRule('.toggle-box');
    const guideDetailRule = getRule('.guide-toggle-copy small');

    expect(toolbarRule).toContain('display: grid');
    expect(toolbarRule).toContain('grid-template-columns: minmax(180px, 1fr) minmax(360px, auto)');
    expect(toolbarRule).toContain('padding: 14px 16px');
    expect(controlsRule).toContain('display: grid');
    expect(togglesRule).toContain('display: flex');
    expect(guideToggleRule).toContain('min-height: 38px');
    expect(guideToggleRule).toContain('padding: 5px 8px');
    expect(toggleBoxRule).toContain('width: 26px');
    expect(toggleBoxRule).toContain('height: 26px');
    expect(guideDetailRule).toContain('text-overflow: ellipsis');
    expect(guideDetailRule).toContain('white-space: nowrap');
  });

  it('keeps the desktop workspace viewport-fixed with independent control scrolling', () => {
    const appShellRule = getRule('.app-shell');
    const workspaceRule = getRule('.workspace');
    const controlPanelRule = getRule('.control-panel');

    expect(appShellRule).toContain('height: 100dvh');
    expect(appShellRule).toContain('min-height: 100dvh');
    expect(appShellRule).toContain('overflow: hidden');
    expect(workspaceRule).toContain('height: calc(100dvh - 40px)');
    expect(workspaceRule).toContain('min-height: calc(100dvh - 40px)');
    expect(controlPanelRule).toContain('min-height: 0');
    expect(controlPanelRule).toContain('overflow-y: auto');
  });

  it('lets the preview fill the workspace without capping the stage to 58vh', () => {
    const previewPanelRule = getRuleContaining('.preview-panel', 'display: grid');
    const stageRule = getRule('.preview-stage');
    const scalerRule = getRule('.preview-scaler');

    expect(previewPanelRule).toContain('grid-template-rows: auto minmax(0, 1fr) auto');
    expect(previewPanelRule).toContain('height: 100%');
    expect(previewPanelRule).toContain('min-height: 0');
    expect(previewPanelRule).toContain('max-height: none');
    expect(stageRule).toContain('min-height: 0');
    expect(stageRule).toContain('max-height: none');
    expect(stageRule).not.toContain('max-height: 58vh');
    expect(stageRule).toContain('padding: 18px');
    expect(scalerRule).toContain('width: min(100%, 720px)');
  });

  it('keeps mobile layout document-scrolled with a bounded preview row', () => {
    expect(styles).toContain('@media (max-width: 1040px)');
    expect(styles).toContain('height: auto');
    expect(styles).toContain('overflow: visible');
    expect(styles).toContain('overflow-y: visible');
    expect(styles).toContain('grid-template-rows: auto minmax(320px, 54dvh) auto');
  });
});
