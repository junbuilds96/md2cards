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

describe('social card CSS', () => {
  it('hides card labels without changing body layout or typography', () => {
    const cardRule = getRule('.social-card');
    const labelRule = getRule(
      '.social-card.card-labels-hidden .card-chrome,\n.social-card.card-labels-hidden .card-footer',
    );

    expect(cardRule).toContain('grid-template-rows: auto minmax(0, 1fr) auto');
    expect(labelRule).toContain('visibility: hidden');
    expect(styles).not.toMatch(/\.social-card\.card-labels-hidden\s*\{\s*grid-template-rows:/);
    expect(styles).not.toContain('.social-card.card-labels-hidden .markdown-card-body');
    expect(styles).not.toContain('--card-clean-');
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

  it('defines background intensity classes that alter exported card visuals', () => {
    const cardRule = getRule('.social-card');
    const softRule = getRule('.social-card.background-soft');
    const vividRule = getRule('.social-card.background-vivid');

    expect(cardRule).toContain('linear-gradient(var(--card-intensity-overlay), var(--card-intensity-overlay))');
    expect(cardRule).toContain('radial-gradient(circle at 88% 84%, var(--card-edge-glow)');
    expect(cardRule).toContain('border: var(--card-border-width) solid var(--card-border)');
    expect(cardRule).toContain('box-shadow: var(--card-shadow)');
    expect(softRule).toContain('--card-intensity-overlay: var(--card-soft-overlay)');
    expect(softRule).toContain('--card-glow-stop: 21%');
    expect(vividRule).toContain('--card-intensity-overlay: var(--card-vivid-overlay)');
    expect(vividRule).toContain('--card-border-width: 2px');
    expect(vividRule).toContain('--card-edge-glow: var(--card-glow)');
  });

  it('defines corner radius classes without changing export sizing rules', () => {
    const cardRule = getRule('.social-card');
    const sharpRule = getRule('.social-card.radius-sharp');
    const subtleRule = getRule('.social-card.radius-subtle');
    const roundedRule = getRule('.social-card.radius-rounded');
    const codeRule = getRule('.markdown-card-body code');
    const preRule = getRule('.markdown-card-body pre');

    expect(cardRule).toContain('width: 100%');
    expect(cardRule).toContain('height: 100%');
    expect(cardRule).toContain('overflow: hidden');
    expect(cardRule).toContain('border-radius: var(--card-radius)');
    expect(cardRule).toContain('--card-radius: 0');
    expect(sharpRule).toContain('--card-radius: 0');
    expect(subtleRule).toContain('--card-radius: clamp(18px, 3cqw, 42px)');
    expect(roundedRule).toContain('--card-radius: clamp(34px, 5cqw, 72px)');
    expect(codeRule).toContain('border-radius: var(--card-inline-radius)');
    expect(preRule).toContain('border-radius: var(--card-surface-radius)');
  });

  it('gives Markdown code, tables, lists, and quotes designed constrained surfaces', () => {
    const cardRule = getRule('.social-card');
    const textRule = getRule(
      '.markdown-card-body p,\n.markdown-card-body li,\n.markdown-card-body td,\n.markdown-card-body th',
    );
    const listRule = getRule('.markdown-card-body ul,\n.markdown-card-body ol');
    const markerRule = getRule('.markdown-card-body li::marker');
    const preRule = getRule('.markdown-card-body pre');
    const preCodeRule = getRule('.markdown-card-body pre code');
    const tableRule = getRule('.markdown-card-body table');
    const tableHeaderRule = getRuleContaining('.markdown-card-body th', 'background: var(--code-bg)');
    const quoteRule = getRule('.markdown-card-body blockquote');
    const quoteParagraphRule = getRule('.markdown-card-body blockquote p');

    expect(cardRule).toContain('--card-surface-bg: var(--code-bg)');
    expect(cardRule).toContain('--card-surface-border: var(--table-rule)');
    expect(cardRule).toContain('--card-code-block-font-size: clamp(12px, 1.45cqw, 24px)');
    expect(textRule).toContain('overflow-wrap: anywhere');
    expect(listRule).toContain('list-style-position: outside');
    expect(markerRule).toContain('font-weight: 850');
    expect(preRule).toContain('linear-gradient(180deg, var(--card-surface-shine), transparent 34%)');
    expect(preRule).toContain('border: 1px solid var(--card-surface-border)');
    expect(preRule).toContain('font-size: var(--card-code-block-font-size)');
    expect(preCodeRule).toContain('white-space: pre-wrap');
    expect(preCodeRule).toContain('overflow-wrap: anywhere');
    expect(tableRule).toContain('table-layout: fixed');
    expect(tableRule).toContain('border-collapse: separate');
    expect(tableRule).toContain('border-radius: var(--card-surface-radius)');
    expect(tableHeaderRule).toContain('background: var(--code-bg)');
    expect(quoteRule).toContain('border-left: var(--card-blockquote-border-width) solid var(--card-accent)');
    expect(quoteRule).toContain('background:');
    expect(quoteParagraphRule).toContain('font-weight: 800');
  });

  it('keeps the preview toolbar compact and grouped', () => {
    const toolbarRule = getRule('.preview-toolbar');
    const controlsRule = getRule('.preview-controls');
    const togglesRule = getRule('.preview-toggles');
    const guideToggleRule = getRule('.guide-toggle');
    const toggleBoxRule = getRule('.toggle-box');
    const guideDetailRule = getRule('.guide-toggle-copy small');
    const githubStarRule = getRule('.github-star-link');

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
    expect(githubStarRule).toContain('display: inline-flex');
    expect(githubStarRule).toContain('min-height: 38px');
    expect(githubStarRule).toContain('text-decoration: none');
  });

  it('keeps the desktop workspace viewport-fixed with independent control scrolling', () => {
    const rootRule = getRule(':root');
    const bodyRule = getRule('body');
    const reactRootRule = getRule('#root');
    const appShellRule = getRule('.app-shell');
    const workspaceRule = getRule('.workspace');
    const controlPanelRule = getRule('.control-panel');

    expect(rootRule).toContain('height: 100%');
    expect(rootRule).toContain('overflow: hidden');
    expect(bodyRule).toContain('height: 100dvh');
    expect(bodyRule).toContain('overflow: hidden');
    expect(reactRootRule).toContain('height: 100%');
    expect(reactRootRule).toContain('overflow: hidden');
    expect(appShellRule).toContain('height: 100dvh');
    expect(appShellRule).toContain('min-height: 100dvh');
    expect(appShellRule).toContain('overflow: hidden');
    expect(workspaceRule).toContain('height: calc(100dvh - 40px)');
    expect(workspaceRule).toContain('min-height: calc(100dvh - 40px)');
    expect(controlPanelRule).toContain('contain: layout paint');
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
    const mobileRootRule = getRuleContaining(':root', 'height: auto');
    const mobileBodyRule = getRuleContaining('body', 'height: auto');
    const mobileReactRootRule = getRuleContaining('#root', 'height: auto');

    expect(styles).toContain('@media (max-width: 1040px)');
    expect(mobileRootRule).toContain('overflow: visible');
    expect(mobileBodyRule).toContain('overflow-y: visible');
    expect(mobileReactRootRule).toContain('overflow: visible');
    expect(styles).toContain('contain: none');
    expect(styles).toContain('height: auto');
    expect(styles).toContain('overflow: visible');
    expect(styles).toContain('overflow-y: visible');
    expect(styles).toContain('grid-template-rows: auto minmax(320px, 54dvh) auto');
    expect(styles).toContain('.github-star-link,\n  .export-actions button');
    expect(styles).toContain('.corner-radius-control');
  });
});
