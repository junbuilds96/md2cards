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
    const bodyRule = getRule('.social-card.card-labels-hidden .markdown-card-body');
    const h1Rule = getRule('.social-card.card-labels-hidden .markdown-card-body h1');
    const tableCellRule = getRule(
      '.social-card.card-labels-hidden .markdown-card-body th,\n.social-card.card-labels-hidden .markdown-card-body td',
    );

    expect(bodyRule).toContain('justify-content: flex-start');
    expect(bodyRule).toContain('padding-block: clamp(30px, 6cqh, 60px)');
    expect(h1Rule).toContain('font-size: clamp(32px, 6cqw, 96px)');
    expect(tableCellRule).toContain('font-size: clamp(14px, 2.05cqw, 33px)');
  });

  it('keeps markdown children and h2 from collapsing into clipped fragments', () => {
    const childRule = getRule('.social-card.card-labels-hidden .markdown-card-body > *');
    const h2Rule = getRule('.social-card.card-labels-hidden .markdown-card-body h2');

    expect(childRule).toContain('flex-shrink: 0');
    expect(h2Rule).toContain('font-size: clamp(20px, 2.5cqw, 40px)');
    expect(h2Rule).not.toMatch(/(?:^|[;\s])(?:height|max-height)\s*:\s*0/);
  });
});
