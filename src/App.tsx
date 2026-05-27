import { useMemo, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Check,
  Clipboard,
  Download,
  ImageDown,
  LayoutTemplate,
  PanelRightOpen,
  RotateCcw,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import {
  cardThemes,
  defaultExportScaleId,
  exportScaleOptions,
  getExportPixelSize,
  getExportScaleOption,
  getMarkdownTemplate,
  getSafeAreaGuide,
  getStarterMarkdown,
  markdownTemplates,
  platformPresets,
  sampleMarkdown,
  type CardTheme,
  type ExportScaleId,
  type PlatformPreset,
  type TemplateId,
} from './cardOptions';
import { copyCard, downloadCard } from './exportImage';

type ExportState = 'idle' | 'copying' | 'copied' | 'downloading' | 'error';
type StarterCopyState = 'idle' | 'copying' | 'copied' | 'error';

function firstMarkdownHeading(markdown: string): string {
  const heading = markdown
    .split('\n')
    .find((line) => /^#{1,3}\s+\S/.test(line))
    ?.replace(/^#{1,3}\s+/, '');

  return heading || 'MD2Cards';
}

function CardPreview({
  markdown,
  preset,
  theme,
  cardRef,
}: {
  markdown: string;
  preset: PlatformPreset;
  theme: CardTheme;
  cardRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div
      ref={cardRef}
      className={`social-card ${theme.className}`}
      style={{
        aspectRatio: `${preset.width} / ${preset.height}`,
      }}
    >
      <div className="card-chrome">
        <span>MD2Cards</span>
        <span>{preset.label}</span>
      </div>
      <div className="markdown-card-body">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
      </div>
      <div className="card-footer">
        <span>Markdown to social PNG</span>
        <span>{preset.sizeLabel}</span>
      </div>
    </div>
  );
}

function SafeAreaOverlay({
  preset,
  guide,
}: {
  preset: PlatformPreset;
  guide: ReturnType<typeof getSafeAreaGuide>;
}) {
  return (
    <div className="safe-area-overlay" aria-hidden="true">
      <div
        className="safe-area-frame"
        style={{
          inset: `${guide.marginPercent}%`,
        }}
      >
        <div className="safe-area-label">
          <ShieldCheck size={15} />
          <span>Safe area</span>
        </div>
        <div className="safe-area-detail">
          {preset.label}: {guide.marginLabel}
        </div>
      </div>
    </div>
  );
}

function App() {
  const [markdown, setMarkdown] = useState(sampleMarkdown);
  const [presetId, setPresetId] = useState<PlatformPreset['id']>('twitter');
  const [themeId, setThemeId] = useState<CardTheme['id']>('signal');
  const [exportScaleId, setExportScaleId] = useState<ExportScaleId>(defaultExportScaleId);
  const [activeTemplateId, setActiveTemplateId] = useState<TemplateId>('x-launch');
  const [showSafeAreaGuide, setShowSafeAreaGuide] = useState(true);
  const [exportState, setExportState] = useState<ExportState>('idle');
  const [starterCopyState, setStarterCopyState] = useState<StarterCopyState>('idle');
  const [message, setMessage] = useState('Ready to export.');
  const cardRef = useRef<HTMLDivElement | null>(null);

  const preset = useMemo(
    () => platformPresets.find((item) => item.id === presetId) ?? platformPresets[0],
    [presetId],
  );
  const theme = useMemo(() => cardThemes.find((item) => item.id === themeId) ?? cardThemes[0], [themeId]);
  const exportScale = useMemo(() => getExportScaleOption(exportScaleId), [exportScaleId]);
  const exportPixelSize = useMemo(() => getExportPixelSize(preset, exportScale), [preset, exportScale]);
  const safeAreaGuide = useMemo(() => getSafeAreaGuide(preset), [preset]);
  const title = useMemo(() => firstMarkdownHeading(markdown), [markdown]);

  function applyTemplate(templateId: TemplateId) {
    const template = getMarkdownTemplate(templateId);

    setMarkdown(template.markdown);
    setPresetId(template.presetId);
    setThemeId(template.themeId);
    setActiveTemplateId(template.id);
    setMessage(`${template.label} loaded. Replace the text with your own Markdown when ready.`);
    setExportState('idle');
    setStarterCopyState('idle');
  }

  async function handleCopyStarterMarkdown() {
    if (!navigator.clipboard?.writeText) {
      setStarterCopyState('error');
      setMessage('Text clipboard support is not available. The starter is still editable below.');
      return;
    }

    try {
      setStarterCopyState('copying');
      await navigator.clipboard.writeText(getStarterMarkdown(activeTemplateId));
      setStarterCopyState('copied');
      setMessage('Starter Markdown copied. Paste it anywhere, then replace it with your own text.');
      window.setTimeout(() => setStarterCopyState('idle'), 1800);
    } catch (error) {
      setStarterCopyState('error');
      setMessage(error instanceof Error ? error.message : 'Unable to copy starter Markdown.');
    }
  }

  async function handleCopy() {
    if (!cardRef.current) return;

    try {
      setExportState('copying');
      setMessage(`Rendering ${exportScale.label} PNG for clipboard...`);
      await copyCard(cardRef.current, preset, exportScale);
      setExportState('copied');
      setMessage(`${exportScale.label} PNG copied to clipboard.`);
      window.setTimeout(() => setExportState('idle'), 1800);
    } catch (error) {
      setExportState('error');
      setMessage(error instanceof Error ? error.message : 'Copy failed.');
    }
  }

  async function handleDownload() {
    if (!cardRef.current) return;

    try {
      setExportState('downloading');
      setMessage(`Rendering ${exportScale.label} PNG download...`);
      await downloadCard(cardRef.current, preset, title, exportScale);
      setExportState('idle');
      setMessage(`${exportScale.label} PNG download started.`);
    } catch (error) {
      setExportState('error');
      setMessage(error instanceof Error ? error.message : 'Download failed.');
    }
  }

  return (
    <main className="app-shell">
      <section className="workspace">
        <aside className="control-panel" aria-label="Markdown card controls">
          <div className="brand-block">
            <div className="brand-mark" aria-hidden="true">
              <Sparkles size={20} />
            </div>
            <div>
              <p className="eyebrow">MD2Cards</p>
              <h1>Markdown in. Polished cards out.</h1>
            </div>
          </div>

          <div className="onboarding-strip">
            <PanelRightOpen size={18} />
            <div className="onboarding-content">
              <p>Pick a starter, replace the Markdown with your update, then copy or download a PNG.</p>
              <button className="ghost-button onboarding-action" type="button" onClick={handleCopyStarterMarkdown}>
                {starterCopyState === 'copied' ? <Check size={16} /> : <Clipboard size={16} />}
                {starterCopyState === 'copying'
                  ? 'Copying...'
                  : starterCopyState === 'copied'
                    ? 'Starter Copied'
                    : 'Copy Starter Markdown'}
              </button>
            </div>
          </div>

          <div className="field-group">
            <span className="field-label">Starter Templates</span>
            <div className="template-gallery">
              {markdownTemplates.map((item) => (
                <button
                  key={item.id}
                  className={item.id === activeTemplateId ? 'active' : ''}
                  type="button"
                  onClick={() => applyTemplate(item.id)}
                >
                  <LayoutTemplate size={16} />
                  <span>{item.label}</span>
                  <small>{item.description}</small>
                </button>
              ))}
            </div>
          </div>

          <div className="field-group">
            <div className="group-header">
              <label htmlFor="markdown-input">Markdown</label>
              <button className="ghost-button" type="button" onClick={() => applyTemplate(activeTemplateId)}>
                <RotateCcw size={16} />
                Reset Starter
              </button>
            </div>
            <textarea
              id="markdown-input"
              value={markdown}
              onChange={(event) => {
                setMarkdown(event.target.value);
                setMessage('Editing Markdown. Preview updates live.');
                setExportState('idle');
                setStarterCopyState('idle');
              }}
              spellCheck="false"
            />
          </div>

          <div className="field-group">
            <span className="field-label">Platform</span>
            <div className="segmented-control">
              {platformPresets.map((item) => (
                <button
                  key={item.id}
                  className={item.id === preset.id ? 'active' : ''}
                  type="button"
                  onClick={() => setPresetId(item.id)}
                >
                  <span>{item.label}</span>
                  <small>{item.sizeLabel}</small>
                </button>
              ))}
            </div>
          </div>

          <div className="field-group">
            <span className="field-label">Theme</span>
            <div className="theme-grid">
              {cardThemes.map((item) => (
                <button
                  key={item.id}
                  className={`theme-option ${item.className} ${item.id === theme.id ? 'active' : ''}`}
                  type="button"
                  onClick={() => setThemeId(item.id)}
                  title={item.description}
                >
                  <span className="swatch" aria-hidden="true" />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="field-group">
            <span className="field-label">Export Quality</span>
            <div className="quality-control">
              {exportScaleOptions.map((item) => (
                <button
                  key={item.id}
                  className={item.id === exportScale.id ? 'active' : ''}
                  type="button"
                  onClick={() => {
                    setExportScaleId(item.id);
                    setExportState('idle');
                    setMessage(`${item.label} selected. Copy PNG and Download will use ${item.shortLabel}.`);
                  }}
                >
                  <span>{item.label}</span>
                  <small>
                    {item.shortLabel} · {item.id === 'fast' ? 'quick checks' : 'sharper posts'}
                  </small>
                </button>
              ))}
            </div>
            <p className="field-hint">
              {exportScale.description} Approx. {exportPixelSize.width} x {exportPixelSize.height}px PNG.
            </p>
          </div>
        </aside>

        <section className="preview-panel" aria-label="Live card preview">
          <div className="preview-toolbar">
            <div>
              <p className="eyebrow">Live Preview</p>
              <h2>{title}</h2>
            </div>
            <div className="preview-controls">
              <label className="guide-toggle">
                <input
                  type="checkbox"
                  checked={showSafeAreaGuide}
                  onChange={(event) => {
                    setShowSafeAreaGuide(event.target.checked);
                    setMessage(
                      event.target.checked
                        ? `Safe area guide shown for ${preset.label}: ${safeAreaGuide.marginLabel}.`
                        : 'Safe area guide hidden. Exports are unchanged.',
                    );
                  }}
                />
                <span className="toggle-box" aria-hidden="true">
                  <ShieldCheck size={16} />
                </span>
                <span className="guide-toggle-copy">
                  <strong>Safe area</strong>
                  <small>Avoid cropped UI/platform overlays on X/Twitter, Xiaohongshu, and launch cards.</small>
                </span>
              </label>
              <div className="export-actions">
                <button className="secondary-button" type="button" onClick={handleCopy}>
                  {exportState === 'copied' ? <Check size={18} /> : <Clipboard size={18} />}
                  {exportState === 'copying' ? 'Copying...' : exportState === 'copied' ? 'Copied' : 'Copy PNG'}
                </button>
                <button className="primary-button" type="button" onClick={handleDownload}>
                  {exportState === 'downloading' ? <ImageDown size={18} /> : <Download size={18} />}
                  {exportState === 'downloading' ? 'Exporting...' : 'Download'}
                </button>
              </div>
            </div>
          </div>

          <div className="preview-stage">
            <div
              className="preview-scaler"
              style={{
                aspectRatio: `${preset.width} / ${preset.height}`,
              }}
            >
              <div className="preview-zoom">
                <CardPreview markdown={markdown} preset={preset} theme={theme} cardRef={cardRef} />
              </div>
              {showSafeAreaGuide ? <SafeAreaOverlay preset={preset} guide={safeAreaGuide} /> : null}
            </div>
          </div>

          <div className={`status-line ${exportState === 'error' ? 'error' : ''}`} role="status">
            <span>{message}</span>
            <span>
              {theme.label} · {preset.sizeLabel} · Export {exportPixelSize.width} x {exportPixelSize.height}px
            </span>
          </div>
        </section>
      </section>
    </main>
  );
}

export default App;
