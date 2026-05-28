import { type ChangeEvent, type DragEvent, type RefObject, useMemo, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  AlertCircle,
  Check,
  Clipboard,
  FolderOpen,
  Download,
  FileCode2,
  FileUp,
  ImageDown,
  LayoutTemplate,
  PanelRightOpen,
  RotateCcw,
  Save,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
} from 'lucide-react';
import {
  cardThemes,
  defaultExportScaleId,
  exportScaleOptions,
  fitMarkdownToPreset,
  getExportPixelSize,
  getExportScaleOption,
  getMarkdownFitGuidance,
  getMarkdownTemplate,
  getPlatformFitHelper,
  getSafeAreaGuide,
  getStarterMarkdown,
  markdownTemplates,
  onboardingWorkflowSteps,
  platformPresets,
  sampleMarkdown,
  type CardTheme,
  type ExportScaleId,
  type PlatformPreset,
  type TemplateId,
} from './cardOptions';
import { copyCard, downloadCard, downloadSvgCard } from './exportImage';
import { validateMarkdownImportFile } from './markdownFileImport';
import {
  deleteSavedPreset,
  readSavedPresets,
  saveSavedPreset,
  type SavedCardPreset,
} from './savedPresets';

type ExportState = 'idle' | 'copying' | 'copied' | 'downloading-png' | 'downloading-svg' | 'error';
type StarterCopyState = 'idle' | 'copying' | 'copied' | 'error';
type ImportState = 'idle' | 'importing' | 'success' | 'error';
type PresetSaveState = 'idle' | 'saved' | 'error';

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
  isBlank,
  cardRef,
}: {
  markdown: string;
  preset: PlatformPreset;
  theme: CardTheme;
  isBlank: boolean;
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
        {isBlank ? (
          <div className="empty-card-state">
            <strong>Paste Markdown to preview your card</strong>
            <span>Headings, lists, tables, code, and quotes render here.</span>
          </div>
        ) : (
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
        )}
      </div>
      <div className="card-footer">
        <span>Markdown to social card</span>
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

function OnboardingChecklist({
  starterCopyState,
  onCopyStarterMarkdown,
}: {
  starterCopyState: StarterCopyState;
  onCopyStarterMarkdown: () => void;
}) {
  return (
    <section className="onboarding-checklist" aria-labelledby="workflow-title">
      <div className="onboarding-heading">
        <PanelRightOpen size={18} />
        <div>
          <p className="eyebrow">Getting Started</p>
          <h2 id="workflow-title">60-second workflow</h2>
        </div>
      </div>
      <ol className="workflow-steps">
        {onboardingWorkflowSteps.map((step, index) => (
          <li key={step.id}>
            <span className="workflow-step-index">{index + 1}</span>
            <span>
              <strong>{step.label}</strong>
              <small>{step.detail}</small>
            </span>
          </li>
        ))}
      </ol>
      <button className="ghost-button onboarding-action" type="button" onClick={onCopyStarterMarkdown}>
        {starterCopyState === 'copied' ? <Check size={16} /> : <Clipboard size={16} />}
        {starterCopyState === 'copying'
          ? 'Copying...'
          : starterCopyState === 'copied'
            ? 'Starter Copied'
            : 'Copy Starter Markdown'}
      </button>
    </section>
  );
}

function MarkdownFileImporter({
  importState,
  importMessage,
  isDraggingImport,
  fileInputRef,
  onChooseFile,
  onFileInputChange,
  onImportDrop,
  onImportDragOver,
  onImportDragLeave,
}: {
  importState: ImportState;
  importMessage: string;
  isDraggingImport: boolean;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onChooseFile: () => void;
  onFileInputChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onImportDrop: (event: DragEvent<HTMLDivElement>) => void;
  onImportDragOver: (event: DragEvent<HTMLDivElement>) => void;
  onImportDragLeave: (event: DragEvent<HTMLDivElement>) => void;
}) {
  return (
    <div
      className={`markdown-import ${isDraggingImport ? 'dragging' : ''} ${importState}`}
      onDrop={onImportDrop}
      onDragOver={onImportDragOver}
      onDragLeave={onImportDragLeave}
    >
      <div className="markdown-import-icon" aria-hidden="true">
        <FileUp size={20} />
      </div>
      <div className="markdown-import-copy">
        <strong>Drop a Markdown file here</strong>
        <span>.md, .markdown, or .txt up to 1 MB</span>
        {importMessage ? (
          <small className="markdown-import-status">
            {importState === 'error' ? <AlertCircle size={14} /> : <Check size={14} />}
            {importMessage}
          </small>
        ) : null}
      </div>
      <button
        className="ghost-button markdown-import-action"
        type="button"
        onClick={onChooseFile}
        disabled={importState === 'importing'}
      >
        <Upload size={16} />
        {importState === 'importing' ? 'Importing...' : 'Choose File'}
      </button>
      <input
        ref={fileInputRef}
        className="file-input"
        type="file"
        accept=".md,.markdown,.txt,text/markdown,text/plain"
        onChange={onFileInputChange}
      />
    </div>
  );
}

function SavedPresetsPanel({
  presetName,
  savedPresets,
  saveState,
  onPresetNameChange,
  onSavePreset,
  onLoadPreset,
  onDeletePreset,
}: {
  presetName: string;
  savedPresets: SavedCardPreset[];
  saveState: PresetSaveState;
  onPresetNameChange: (name: string) => void;
  onSavePreset: () => void;
  onLoadPreset: (preset: SavedCardPreset) => void;
  onDeletePreset: (preset: SavedCardPreset) => void;
}) {
  function getPresetSummary(savedPreset: SavedCardPreset): string {
    const platformLabel = platformPresets.find((item) => item.id === savedPreset.presetId)?.label ?? savedPreset.presetId;
    const themeLabel = cardThemes.find((item) => item.id === savedPreset.themeId)?.label ?? savedPreset.themeId;
    const scaleLabel =
      exportScaleOptions.find((item) => item.id === savedPreset.exportScaleId)?.shortLabel ??
      savedPreset.exportScaleId;

    return `${platformLabel} · ${themeLabel} · ${scaleLabel}`;
  }

  return (
    <div className="saved-presets-panel">
      <div className="preset-save-row">
        <label className="preset-name-field">
          <span>Name</span>
          <input
            type="text"
            value={presetName}
            onChange={(event) => onPresetNameChange(event.target.value)}
            placeholder="Launch post, weekly update..."
            maxLength={60}
          />
        </label>
        <button className="primary-button preset-save-button" type="button" onClick={onSavePreset}>
          {saveState === 'saved' ? <Check size={16} /> : <Save size={16} />}
          {saveState === 'saved' ? 'Saved' : 'Save'}
        </button>
      </div>

      <div className="saved-preset-list" aria-live="polite">
        {savedPresets.length === 0 ? (
          <div className="empty-preset-list">
            <strong>No saved presets yet</strong>
            <span>Save one reusable setup for your next card.</span>
          </div>
        ) : (
          savedPresets.map((preset) => (
            <div className="saved-preset-item" key={preset.id}>
              <button type="button" className="saved-preset-load" onClick={() => onLoadPreset(preset)}>
                <FolderOpen size={16} />
                <span>
                  <strong>{preset.name}</strong>
                  <small>{getPresetSummary(preset)}</small>
                </span>
              </button>
              <button
                className="icon-button"
                type="button"
                onClick={() => onDeletePreset(preset)}
                title={`Delete ${preset.name}`}
                aria-label={`Delete ${preset.name}`}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
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
  const [importState, setImportState] = useState<ImportState>('idle');
  const [importMessage, setImportMessage] = useState('');
  const [isDraggingImport, setIsDraggingImport] = useState(false);
  const [fitMessage, setFitMessage] = useState('');
  const [presetName, setPresetName] = useState('');
  const [savedPresets, setSavedPresets] = useState<SavedCardPreset[]>(() => readSavedPresets());
  const [presetSaveState, setPresetSaveState] = useState<PresetSaveState>('idle');
  const [message, setMessage] = useState('Ready to export.');
  const cardRef = useRef<HTMLDivElement | null>(null);
  const markdownInputRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const preset = useMemo(
    () => platformPresets.find((item) => item.id === presetId) ?? platformPresets[0],
    [presetId],
  );
  const theme = useMemo(() => cardThemes.find((item) => item.id === themeId) ?? cardThemes[0], [themeId]);
  const exportScale = useMemo(() => getExportScaleOption(exportScaleId), [exportScaleId]);
  const exportPixelSize = useMemo(() => getExportPixelSize(preset, exportScale), [preset, exportScale]);
  const safeAreaGuide = useMemo(() => getSafeAreaGuide(preset), [preset]);
  const platformFitHelper = useMemo(() => getPlatformFitHelper(preset), [preset]);
  const markdownGuidance = useMemo(() => getMarkdownFitGuidance(markdown, preset), [markdown, preset]);
  const title = useMemo(() => firstMarkdownHeading(markdown), [markdown]);
  const canExport = !markdownGuidance.stats.isBlank;

  function resetEditorFeedback() {
    setFitMessage('');
    setExportState('idle');
    setStarterCopyState('idle');
    setPresetSaveState('idle');
  }

  function applyTemplate(templateId: TemplateId) {
    const template = getMarkdownTemplate(templateId);

    setMarkdown(template.markdown);
    setPresetId(template.presetId);
    setThemeId(template.themeId);
    setActiveTemplateId(template.id);
    setMessage(`${template.label} loaded. Replace the text with your own Markdown when ready.`);
    setImportState('idle');
    setImportMessage('');
    resetEditorFeedback();
  }

  function startBlankMarkdown() {
    setMarkdown('');
    setMessage('Blank editor ready. Paste Markdown to create a card.');
    setImportState('idle');
    setImportMessage('');
    resetEditorFeedback();
    window.setTimeout(() => markdownInputRef.current?.focus(), 0);
  }

  function handleSavePreset() {
    try {
      const result = saveSavedPreset({
        name: presetName,
        markdown,
        presetId: preset.id,
        themeId: theme.id,
        exportScaleId: exportScale.id,
      });

      setSavedPresets(result.presets);
      setPresetName(result.preset.name);
      setPresetSaveState('saved');
      setMessage(
        result.created
          ? `${result.preset.name} saved locally.`
          : `${result.preset.name} updated locally.`,
      );
      window.setTimeout(() => setPresetSaveState('idle'), 1800);
    } catch (error) {
      setPresetSaveState('error');
      setMessage(error instanceof Error ? error.message : 'Unable to save this preset.');
    }
  }

  function handleLoadSavedPreset(savedPreset: SavedCardPreset) {
    setMarkdown(savedPreset.markdown);
    setPresetId(savedPreset.presetId);
    setThemeId(savedPreset.themeId);
    setExportScaleId(savedPreset.exportScaleId);
    setPresetName(savedPreset.name);
    setMessage(`${savedPreset.name} loaded. Preview updated from your local preset.`);
    setImportState('idle');
    setImportMessage('');
    resetEditorFeedback();
    window.setTimeout(() => markdownInputRef.current?.focus(), 0);
  }

  function handleDeleteSavedPreset(savedPreset: SavedCardPreset) {
    setSavedPresets(deleteSavedPreset(savedPreset.id));
    setMessage(`${savedPreset.name} deleted from local presets.`);
    setPresetSaveState('idle');
  }

  function handleFitMarkdown() {
    const result = fitMarkdownToPreset(markdown, preset);

    if (result.changed) {
      setMarkdown(result.markdown);
    }

    setFitMessage(result.note);
    setMessage(result.note);
    setExportState('idle');
    setStarterCopyState('idle');
    setImportState('idle');
    setImportMessage('');
  }

  async function importMarkdownFile(file: File | undefined) {
    setIsDraggingImport(false);
    resetEditorFeedback();

    if (!file) {
      return;
    }

    const validation = validateMarkdownImportFile(file);
    if (!validation.valid) {
      setImportState('error');
      setImportMessage(validation.message);
      setMessage(validation.message);
      return;
    }

    try {
      setImportState('importing');
      setImportMessage(`Importing ${file.name}...`);
      setMessage(`Reading ${file.name}...`);

      const importedMarkdown = (await file.text()).replace(/\r\n?/g, '\n');

      if (importedMarkdown.trim().length === 0) {
        const emptyMessage = 'This file has no Markdown content to preview.';
        setImportState('error');
        setImportMessage(emptyMessage);
        setMessage(emptyMessage);
        return;
      }

      setMarkdown(importedMarkdown);
      setImportState('success');
      setImportMessage(`Imported ${file.name}.`);
      setMessage(`Imported ${file.name}. Preview updated and ready to export.`);
      window.setTimeout(() => markdownInputRef.current?.focus(), 0);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unable to read this file.';
      setImportState('error');
      setImportMessage(errorMessage);
      setMessage(errorMessage);
    }
  }

  function handleChooseFile() {
    fileInputRef.current?.click();
  }

  function handleFileInputChange(event: ChangeEvent<HTMLInputElement>) {
    void importMarkdownFile(event.target.files?.[0]);
    event.target.value = '';
  }

  function handleImportDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();

    if (event.dataTransfer.types.includes('Files')) {
      setIsDraggingImport(true);
    }
  }

  function handleImportDragLeave(event: DragEvent<HTMLDivElement>) {
    const nextTarget = event.relatedTarget;

    if (!(nextTarget instanceof Node) || !event.currentTarget.contains(nextTarget)) {
      setIsDraggingImport(false);
    }
  }

  function handleImportDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    void importMarkdownFile(event.dataTransfer.files[0]);
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
    if (!canExport) {
      setExportState('error');
      setMessage('Paste Markdown before copying an image.');
      markdownInputRef.current?.focus();
      return;
    }

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
    if (!canExport) {
      setExportState('error');
      setMessage('Paste Markdown before downloading an image.');
      markdownInputRef.current?.focus();
      return;
    }

    if (!cardRef.current) return;

    try {
      setExportState('downloading-png');
      setMessage(`Rendering ${exportScale.label} PNG download...`);
      await downloadCard(cardRef.current, preset, title, exportScale);
      setExportState('idle');
      setMessage(`${exportScale.label} PNG download started.`);
    } catch (error) {
      setExportState('error');
      setMessage(error instanceof Error ? error.message : 'Download failed.');
    }
  }

  async function handleDownloadSvg() {
    if (!canExport) {
      setExportState('error');
      setMessage('Paste Markdown before downloading an SVG.');
      markdownInputRef.current?.focus();
      return;
    }

    if (!cardRef.current) return;

    try {
      setExportState('downloading-svg');
      setMessage(`Rendering ${exportScale.label} SVG download...`);
      await downloadSvgCard(cardRef.current, preset, title, exportScale);
      setExportState('idle');
      setMessage(`${exportScale.label} SVG download started.`);
    } catch (error) {
      setExportState('error');
      setMessage(error instanceof Error ? error.message : 'SVG download failed.');
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

          <OnboardingChecklist
            starterCopyState={starterCopyState}
            onCopyStarterMarkdown={handleCopyStarterMarkdown}
          />

          <div className="field-group">
            <div className="group-header">
              <span className="field-label">Paste-Ready Examples</span>
              <button className="ghost-button" type="button" onClick={startBlankMarkdown}>
                <FileCode2 size={16} />
                Start Blank
              </button>
            </div>
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
              <div className="editor-actions">
                <button
                  className="ghost-button"
                  type="button"
                  onClick={handleFitMarkdown}
                  disabled={markdownGuidance.stats.isBlank}
                >
                  <Sparkles size={16} />
                  Fit to {preset.label}
                </button>
                <button className="ghost-button" type="button" onClick={() => applyTemplate(activeTemplateId)}>
                  <RotateCcw size={16} />
                  Reset Starter
                </button>
              </div>
            </div>
            <MarkdownFileImporter
              importState={importState}
              importMessage={importMessage}
              isDraggingImport={isDraggingImport}
              fileInputRef={fileInputRef}
              onChooseFile={handleChooseFile}
              onFileInputChange={handleFileInputChange}
              onImportDrop={handleImportDrop}
              onImportDragOver={handleImportDragOver}
              onImportDragLeave={handleImportDragLeave}
            />
            <textarea
              id="markdown-input"
              ref={markdownInputRef}
              value={markdown}
              onChange={(event) => {
                setMarkdown(event.target.value);
                setMessage(
                  event.target.value.trim().length === 0
                    ? 'Paste Markdown to preview and export a card.'
                    : 'Editing Markdown. Preview updates live.',
                );
                setImportState('idle');
                setImportMessage('');
                resetEditorFeedback();
              }}
              placeholder={`# Paste your launch note\n\n- One clear update\n- A proof point or metric\n- A next step`}
              spellCheck="false"
            />
            <div className="platform-fit-helper">
              <strong>{preset.label} fit</strong>
              <span>Best for {platformFitHelper.bestFor}</span>
              <small>{platformFitHelper.pasteTip}</small>
            </div>
            <div className={`markdown-guidance ${markdownGuidance.tone}`}>
              <span>{markdownGuidance.summary}</span>
              <span>{markdownGuidance.action}</span>
              <span>
                {markdownGuidance.stats.nonEmptyLineCount}/{markdownGuidance.lineLimit} content lines ·{' '}
                {markdownGuidance.stats.characterCount}/{markdownGuidance.characterLimit} chars
              </span>
            </div>
            {fitMessage ? <div className="fit-status">{fitMessage}</div> : null}
          </div>

          <div className="field-group">
            <span className="field-label">Platform</span>
            <div className="segmented-control">
              {platformPresets.map((item) => (
                <button
                  key={item.id}
                  className={item.id === preset.id ? 'active' : ''}
                  type="button"
                  onClick={() => {
                    setPresetId(item.id);
                    setFitMessage('');
                    setMessage(`${item.label} preset selected. Use Fit to ${item.label} for a tighter draft.`);
                  }}
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
                    setMessage(`${item.label} selected. PNG copy and download will use ${item.shortLabel}.`);
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
              {exportScale.description} Approx. {exportPixelSize.width} x {exportPixelSize.height}px PNG;
              SVG uses the selected preset dimensions.
            </p>
          </div>

          <div className="field-group">
            <span className="field-label">Saved Local Presets</span>
            <SavedPresetsPanel
              presetName={presetName}
              savedPresets={savedPresets}
              saveState={presetSaveState}
              onPresetNameChange={(name) => {
                setPresetName(name);
                setPresetSaveState('idle');
              }}
              onSavePreset={handleSavePreset}
              onLoadPreset={handleLoadSavedPreset}
              onDeletePreset={handleDeleteSavedPreset}
            />
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
                  {exportState === 'downloading-png' ? <ImageDown size={18} /> : <Download size={18} />}
                  {exportState === 'downloading-png' ? 'Exporting...' : 'Download PNG'}
                </button>
                <button className="secondary-button" type="button" onClick={handleDownloadSvg}>
                  {exportState === 'downloading-svg' ? <FileCode2 size={18} /> : <Download size={18} />}
                  {exportState === 'downloading-svg' ? 'Exporting...' : 'Download SVG'}
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
                <CardPreview
                  markdown={markdown}
                  preset={preset}
                  theme={theme}
                  isBlank={markdownGuidance.stats.isBlank}
                  cardRef={cardRef}
                />
              </div>
              {showSafeAreaGuide ? <SafeAreaOverlay preset={preset} guide={safeAreaGuide} /> : null}
            </div>
          </div>

          <div className={`status-line ${exportState === 'error' || importState === 'error' ? 'error' : ''}`} role="status">
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
