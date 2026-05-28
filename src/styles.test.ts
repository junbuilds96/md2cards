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

function expectStylesToContainRule(selector: string, declaration: string): void {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const escapedDeclaration = declaration.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  expect(styles).toMatch(new RegExp(`${escapedSelector}\\s*\\{[^}]*${escapedDeclaration}`));
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

  it('constrains the preview canvas footprint without changing export sizing', () => {
    const stageRule = getRule('.preview-stage');
    const scalerRule = getRule('.preview-scaler');

    expectStylesToContainRule('.preview-panel', 'grid-template-rows: auto minmax(340px, 58vh) auto');
    expectStylesToContainRule('.preview-panel', 'max-height: calc(100vh - 40px)');
    expect(stageRule).toContain('max-height: 58vh');
    expect(stageRule).toContain('padding: 18px');
    expect(scalerRule).toContain('width: min(100%, 720px)');
  });
});
