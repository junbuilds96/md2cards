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
});
