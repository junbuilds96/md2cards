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
    expect(spaciousRule).toContain('--card-list-item-padding-inline: 0.58em');
    expect(spaciousRule).toContain('--card-table-cell-padding: clamp(4px, 0.8cqh, 7px) clamp(8px, 0.9cqw, 14px)');
  });

  it('keeps Twitter card content inside the larger platform safe area with adapted rhythm', () => {
    const twitterRule = getRule('.social-card.preset-twitter');

    expect(twitterRule).toContain('--card-chrome-padding-block: 8cqh');
    expect(twitterRule).toContain('--card-chrome-padding-inline: 10cqw');
    expect(twitterRule).toContain('--card-body-block-padding: 8cqh');
    expect(twitterRule).toContain('--card-body-inline-padding: 10cqw');
    expect(twitterRule).toContain('--card-h1-font-size: clamp(26px, 6.3cqw, 100px)');
    expect(twitterRule).toContain('--card-h1-margin-bottom: clamp(16px, 2.2cqh, 22px)');
    expect(twitterRule).toContain('--card-body-font-size: clamp(15px, 2.35cqw, 37px)');
    expect(twitterRule).toContain('--card-p-margin-bottom: clamp(8px, 1.5cqh, 14px)');
    expect(twitterRule).toContain('--card-list-margin: clamp(6px, 1.1cqh, 10px) 0 clamp(7px, 1.2cqh, 12px)');
    expect(twitterRule).toContain('--card-li-gap: clamp(4px, 0.75cqh, 7px)');
    expect(twitterRule).toContain('--card-list-item-padding-block: 0.3em');
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

  it('gives every card theme distinct CSS personality hooks', () => {
    const cardRule = getRule('.social-card');
    const beforeRule = getRule('.social-card::before');
    const afterRule = getRuleContaining('.social-card::after', 'background-image');
    const signalRule = getRule('.theme-signal');
    const paperRule = getRule('.theme-paper');
    const midnightRule = getRule('.theme-midnight');
    const editorialRule = getRule('.theme-editorial');
    const chromeRule = getRule('.card-chrome,\n.card-footer');
    const h1Rule = getRule('.markdown-card-body h1');
    const h2Rule = getRule('.markdown-card-body h2');
    const codeFrameRule = getRule('.markdown-code-frame');
    const codeHeaderRule = getRule('.markdown-code-header');
    const codeTextRule = getRule('.markdown-code-frame .markdown-code-text');

    expect(cardRule).toContain('isolation: isolate');
    expect(cardRule).toContain('--card-heading-font-family: inherit');
    expect(cardRule).toContain('--card-body-font-family: inherit');
    expect(cardRule).toContain('--card-inline-code-font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace');
    expect(cardRule).toContain('--card-h2-bg: transparent');
    expect(chromeRule).toContain('font-family: var(--card-chrome-font-family)');
    expect(chromeRule).toContain('font-weight: var(--card-chrome-font-weight)');
    expect(chromeRule).toContain('text-transform: var(--card-chrome-text-transform)');
    expect(h1Rule).toContain('font-family: var(--card-heading-font-family)');
    expect(h1Rule).toContain('line-height: var(--card-h1-line-height)');
    expect(h1Rule).toContain('text-shadow: var(--card-heading-text-shadow)');
    expect(h2Rule).toContain('background: var(--card-h2-bg)');
    expect(h2Rule).toContain('border: var(--card-h2-border)');
    expect(cardRule).toContain('--card-personality-layer-image: linear-gradient(transparent, transparent)');
    expect(beforeRule).toContain('background-image: var(--card-personality-layer-image)');
    expect(beforeRule).toContain('background-size: var(--card-personality-layer-size)');
    expect(afterRule).toContain('background-image: var(--card-personality-accent-image)');
    expect(signalRule).toContain('rgba(31, 111, 235, 0.14) 1px');
    expect(signalRule).toContain('--card-personality-layer-size: 96px 96px, 96px 96px, 24px 24px, 24px 24px');
    expect(signalRule).toContain('--card-chrome-font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace');
    expect(signalRule).toContain('--card-h2-bg: linear-gradient(90deg, rgba(31, 111, 235, 0.14)');
    expect(paperRule).toContain('radial-gradient(circle at 1px 1px');
    expect(paperRule).toContain('rgba(189, 59, 50, 0.2)');
    expect(paperRule).toContain('--card-heading-font-family: Georgia, "Times New Roman", serif');
    expect(paperRule).toContain('--card-h2-bg: linear-gradient(180deg, transparent 58%');
    expect(midnightRule).toContain('radial-gradient(circle at 34px 28px, #ff5f57');
    expect(midnightRule).toContain('--card-heading-font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace');
    expect(midnightRule).toContain('--card-h2-border: 1px solid rgba(84, 214, 166, 0.26)');
    expect(midnightRule).toContain('--card-code-header-bg: linear-gradient(90deg, rgba(84, 214, 166, 0.14)');
    expect(editorialRule).toContain('rgba(255, 184, 77, 0.18)');
    expect(editorialRule).toContain('rgba(28, 21, 51, 0.82)');
    expect(editorialRule).toContain('--card-heading-font-family: Georgia, "Times New Roman", serif');
    expect(editorialRule).toContain('--card-h2-bg: linear-gradient(90deg, rgba(226, 85, 121, 0.18)');
    expect(codeFrameRule).toContain('grid-template-rows: auto minmax(0, 1fr)');
    expect(codeHeaderRule).toContain('background: var(--card-code-header-bg)');
    expect(codeTextRule).toContain('display: block');
  });

  it('defines typography voice classes that alter font personality through variables', () => {
    const cardRule = getRule('.social-card');
    const bodyRule = getRule('.markdown-card-body');
    const h1Rule = getRule('.markdown-card-body h1');
    const codeRule = getRule('.markdown-card-body code');
    const quoteParagraphRule = getRule('.markdown-card-body blockquote p');
    const editorialRule = getRule('.social-card.voice-editorial');
    const monoRule = getRule('.social-card.voice-mono');

    expect(cardRule).toContain('--card-body-font-family: inherit');
    expect(cardRule).toContain('--card-blockquote-font-style: normal');
    expect(bodyRule).toContain('font-family: var(--card-body-font-family)');
    expect(bodyRule).toContain('font-weight: var(--card-body-font-weight)');
    expect(h1Rule).toContain('line-height: var(--card-h1-line-height)');
    expect(codeRule).toContain('font-family: var(--card-inline-code-font-family)');
    expect(quoteParagraphRule).toContain('font-family: var(--card-blockquote-font-family)');
    expect(quoteParagraphRule).toContain('font-style: var(--card-blockquote-font-style)');
    expect(styles).not.toContain('.social-card.voice-modern');
    expect(editorialRule).toContain('--card-heading-font-family: Georgia, "Times New Roman", serif');
    expect(editorialRule).toContain('--card-body-font-family: Georgia, "Times New Roman", serif');
    expect(editorialRule).toContain('--card-h1-font-size: clamp(28px, 6.75cqw, 108px)');
    expect(editorialRule).toContain('--card-h2-font-size: clamp(21px, 3.25cqw, 50px)');
    expect(editorialRule).toContain('--card-h1-line-height: 0.96');
    expect(editorialRule).toContain('--card-body-line-height: 1.17');
    expect(editorialRule).toContain('--card-p-margin-bottom: 12px');
    expect(editorialRule).toContain('--card-list-margin: 8px 0 12px');
    expect(editorialRule).toContain('--card-list-item-padding-block: 0.28em');
    expect(editorialRule).toContain('--card-blockquote-font-style: italic');
    expect(monoRule).toContain('--card-heading-font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace');
    expect(monoRule).toContain('--card-chrome-text-transform: uppercase');
    expect(editorialRule).not.toMatch(/(^|\n)\s*width:/);
    expect(editorialRule).not.toMatch(/(^|\n)\s*height:/);
    expect(editorialRule).not.toMatch(/(^|\n)\s*aspect-ratio:/);
    expect(editorialRule).not.toMatch(/(^|\n)\s*grid-template-rows:/);
    expect(monoRule).not.toMatch(/(^|\n)\s*width:/);
    expect(monoRule).not.toMatch(/(^|\n)\s*height:/);
    expect(monoRule).not.toMatch(/(^|\n)\s*aspect-ratio:/);
    expect(monoRule).not.toMatch(/(^|\n)\s*grid-template-rows:/);
  });

  it('defines texture classes that only tune decorative personality overlays', () => {
    const beforeRule = getRule('.social-card::before');
    const afterRule = getRuleContaining('.social-card::after', 'background-image');
    const cleanRule = getRule('.social-card.texture-clean');
    const subtleRule = getRule('.social-card.texture-subtle');
    const richRule = getRule('.social-card.texture-rich');

    expect(beforeRule).toContain('opacity: var(--card-texture-layer-opacity)');
    expect(afterRule).toContain('opacity: var(--card-texture-accent-opacity)');
    expect(cleanRule).toContain('--card-texture-layer-opacity: 0.06');
    expect(cleanRule).toContain('--card-texture-accent-opacity: 0.08');
    expect(subtleRule).toContain('--card-texture-layer-opacity: var(--card-personality-layer-opacity)');
    expect(subtleRule).toContain('--card-texture-accent-opacity: var(--card-personality-accent-opacity)');
    expect(richRule).toContain('--card-texture-layer-opacity: 0.7');
    expect(richRule).toContain('--card-texture-accent-opacity: 0.78');
    expect(cleanRule).not.toContain('--card-body');
    expect(richRule).not.toContain('--card-body');
  });

  it('defines corner radius classes without changing export sizing rules', () => {
    const cardRule = getRule('.social-card');
    const sharpRule = getRule('.social-card.radius-sharp');
    const subtleRule = getRule('.social-card.radius-subtle');
    const roundedRule = getRule('.social-card.radius-rounded');
    const codeRule = getRule('.markdown-card-body code');
    const codeFrameRule = getRule('.markdown-code-frame');

    expect(cardRule).toContain('width: 100%');
    expect(cardRule).toContain('height: 100%');
    expect(cardRule).toContain('overflow: hidden');
    expect(cardRule).toContain('border-radius: var(--card-radius)');
    expect(cardRule).toContain('--card-radius: 0');
    expect(sharpRule).toContain('--card-radius: 0');
    expect(subtleRule).toContain('--card-radius: clamp(18px, 3cqw, 42px)');
    expect(roundedRule).toContain('--card-radius: clamp(34px, 5cqw, 72px)');
    expect(codeRule).toContain('border-radius: var(--card-inline-radius)');
    expect(codeFrameRule).toContain('border-radius: var(--card-surface-radius)');
  });

  it('gives Markdown code, tables, lists, and quotes designed constrained surfaces', () => {
    const cardRule = getRule('.social-card');
    const textRule = getRule(
      '.markdown-card-body p,\n.markdown-card-body li,\n.markdown-card-body td,\n.markdown-card-body th',
    );
    const listRule = getRule('.markdown-card-body ul,\n.markdown-card-body ol');
    const listItemRule = getRule('.markdown-card-body li');
    const listBulletRule = getRule('.markdown-card-body li::before');
    const orderedListRule = getRuleContaining('.markdown-card-body ol', 'counter-reset: markdown-card-list');
    const orderedItemRule = getRule('.markdown-card-body ol > li::before');
    const inlineCodeRule = getRule('.markdown-card-body code');
    const codeFrameRule = getRule('.markdown-code-frame');
    const codeHeaderRule = getRule('.markdown-code-header');
    const codeLanguageRule = getRule('.markdown-code-language');
    const codePreRule = getRule('.markdown-code-pre');
    const codeTextRule = getRule('.markdown-code-frame .markdown-code-text');
    const nestedListRule = getRule('.markdown-card-body li > ul,\n.markdown-card-body li > ol');
    const nestedListItemRule = getRule('.markdown-card-body li li');
    const tableScrollRule = getRule('.markdown-table-scroll');
    const tableRule = getRule('.markdown-card-body table');
    const tableMetricRule = getRule('.markdown-card-body th,\n.markdown-card-body td');
    const tableHeaderRule = getRuleContaining('.markdown-card-body th', 'background: var(--card-table-header-bg)');
    const tableCellRule = getRuleContaining('.markdown-card-body td', 'background: var(--card-table-row-bg)');
    const quoteRule = getRule('.markdown-card-body blockquote');
    const quoteAccentRule = getRule('.markdown-card-body blockquote::before');
    const quoteParagraphRule = getRule('.markdown-card-body blockquote p');

    expect(cardRule).toContain('--card-surface-bg: var(--code-bg)');
    expect(cardRule).toContain('--card-surface-border: var(--table-rule)');
    expect(cardRule).toContain('--card-surface-soft-bg: var(--card-surface-bg)');
    expect(cardRule).toContain('--card-surface-strong-bg: color-mix(in srgb, var(--card-surface-bg) 76%, var(--card-bg))');
    expect(cardRule).toContain('--card-table-header-bg: linear-gradient(180deg, var(--card-surface-shine), var(--code-bg))');
    expect(cardRule).toContain('--card-code-block-font-size: clamp(12px, 1.45cqw, 24px)');
    expect(cardRule).toContain('--card-pre-max-height: min(42cqh, 15lh)');
    expect(cardRule).toContain('--card-code-header-height: clamp(26px, 3.2cqh, 38px)');
    expect(cardRule).toContain('--card-code-label-bg: color-mix(in srgb, var(--card-accent) 14%, var(--card-surface-bg))');
    expect(cardRule).toContain('--card-table-font-size: clamp(11px, 1.28cqw, 22px)');
    expect(cardRule).toContain('--card-table-max-height: 30cqh');
    expect(textRule).toContain('overflow-wrap: anywhere');
    expect(listRule).toContain('display: grid');
    expect(listRule).toContain('list-style: none');
    expect(listItemRule).toContain('background:');
    expect(listItemRule).toContain('border: 1px solid var(--card-surface-border)');
    expect(listItemRule).toContain('border-radius: var(--card-inline-radius)');
    expect(listBulletRule).toContain('box-shadow: 0 0 0 0.22em var(--code-bg)');
    expect(nestedListRule).toContain('margin: var(--card-nested-list-margin)');
    expect(nestedListRule).toContain('gap: calc(var(--card-li-gap) * 0.72)');
    expect(nestedListItemRule).toContain('box-shadow: none');
    expect(orderedListRule).toContain('counter-reset: markdown-card-list');
    expect(orderedItemRule).toContain('content: counter(markdown-card-list)');
    expect(inlineCodeRule).toContain('max-width: 100%');
    expect(inlineCodeRule).toContain('border: 1px solid var(--card-surface-border)');
    expect(inlineCodeRule).toContain('overflow-wrap: anywhere');
    expect(inlineCodeRule).toContain('font-weight: 750');
    expect(codeFrameRule).toContain('linear-gradient(180deg, var(--card-surface-shine), transparent 46%)');
    expect(codeFrameRule).toContain('max-height: var(--card-pre-max-height)');
    expect(codeFrameRule).toContain('overflow: hidden');
    expect(codeFrameRule).toContain('contain: paint');
    expect(codeFrameRule).toContain('font-size: var(--card-code-block-font-size)');
    expect(codeHeaderRule).toContain('min-height: var(--card-code-header-height)');
    expect(codeLanguageRule).toContain('text-overflow: ellipsis');
    expect(codeLanguageRule).toContain('font-weight: 900');
    expect(codePreRule).toContain('max-height: calc(var(--card-pre-max-height) - var(--card-code-header-height))');
    expect(codePreRule).toContain('overflow: hidden auto');
    expect(codePreRule).toContain('scrollbar-width: thin');
    expect(codeTextRule).toContain('white-space: pre-wrap');
    expect(codeTextRule).toContain('overflow-wrap: anywhere');
    expect(codeTextRule).toContain('word-break: break-word');
    expect(tableScrollRule).toContain('max-height: var(--card-table-max-height)');
    expect(tableScrollRule).toContain('overflow: auto');
    expect(tableScrollRule).toContain('scrollbar-width: thin');
    expect(tableRule).toContain('table-layout: fixed');
    expect(tableRule).toContain('border-collapse: separate');
    expect(tableRule).toContain('border-radius: var(--card-surface-radius)');
    expect(tableMetricRule).toContain('font-size: var(--card-table-font-size)');
    expect(tableMetricRule).toContain('line-height: var(--card-table-line-height)');
    expect(tableHeaderRule).toContain('background: var(--card-table-header-bg)');
    expect(tableCellRule).toContain('background: var(--card-table-row-bg)');
    expect(quoteRule).toContain('border-left: var(--card-blockquote-border-width) solid var(--card-accent)');
    expect(quoteRule).toContain('max-height: 32cqh');
    expect(quoteRule).toContain('background:');
    expect(quoteRule).toContain('overflow: hidden');
    expect(quoteAccentRule).toContain('background: linear-gradient(180deg, var(--card-accent), transparent 145%)');
    expect(quoteParagraphRule).toContain('font-size: var(--card-blockquote-font-size)');
    expect(quoteParagraphRule).toContain('font-weight: var(--card-blockquote-font-weight)');
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
