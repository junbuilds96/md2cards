import {
  Children,
  type ChangeEvent,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type DragEvent,
  type RefObject,
  isValidElement,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  AlertCircle,
  Check,
  Clipboard,
  FolderOpen,
  Download,
  FileCode2,
  FileUp,
  Github,
  ImageDown,
  LayoutTemplate,
  Palette,
  PanelRightOpen,
  RotateCcw,
  Save,
  ShieldCheck,
  Sparkles,
  Tags,
  Trash2,
  Upload,
} from 'lucide-react';
import {
  applyStylePackAppearance,
  cardThemes,
  cardAccentOptions,
  cardBackgroundIntensityOptions,
  cardCompositionOptions,
  cardCornerRadiusOptions,
  cardDensityOptions,
  cardMoodOptions,
  cardTextureOptions,
  cardTypographyVoiceOptions,
  cardTypographyScaleOptions,
  defaultCardAccentId,
  defaultCardBackgroundIntensityId,
  defaultCardCompositionId,
  defaultCardCornerRadiusId,
  defaultCardDensityId,
  defaultCardMoodId,
  defaultCardTextureId,
  defaultCardTypographyVoiceId,
  defaultCardTypographyScaleId,
  defaultExportScaleId,
  exportScaleOptions,
  getCardAccentOption,
  getCardBackgroundIntensityOption,
  getCardCompositionOption,
  getCardCornerRadiusOption,
  getCardDensityOption,
  getCardMoodOption,
  getCardTextureOption,
  getCardTypographyVoiceOption,
  getCardTypographyScaleOption,
  fitMarkdownToPreset,
  getExportPixelSize,
  getExportScaleOption,
  getMarkdownFitGuidance,
  getMarkdownTemplate,
  getRecipePreset,
  getStylePack,
  getPlatformFitHelper,
  getSafeAreaGuide,
  getStarterMarkdown,
  markdownTemplates,
  onboardingWorkflowSteps,
  platformPresets,
  recipePresets,
  sampleMarkdown,
  stylePacks,
  type CardAccentId,
  type CardBackgroundIntensityId,
  type CardCompositionId,
  type CardCornerRadiusId,
  type CardDensityId,
  type CardMoodId,
  type CardTextureId,
  type CardTypographyVoiceId,
  type CardTypographyScaleId,
  type CardTheme,
  type ExportScaleId,
  type PlatformPreset,
  type RecipePresetId,
  type StylePackId,
  type TemplateId,
} from './cardOptions';
import {
  parseCardConfigJson,
  serializeCardConfig,
  validateCardConfigImportFile,
} from './cardConfig';
import { getCardAppearanceStyle, getCardClassName, shouldShowCardLabels } from './cardLayout';
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
type RecipeTransferState = 'idle' | 'importing' | 'success' | 'error';

export function getCodeLanguageLabel(className?: string): string {
  const languageClass = className?.split(/\s+/).find((item) => item.startsWith('language-'));
  const language = languageClass?.replace(/^language-/, '').replace(/[^\w#+.-]/g, '').slice(0, 18);

  return language ? language.toUpperCase() : 'CODE';
}

function getCodeBlockLanguageLabel(children: ReactNode): string {
  const codeElement = Children.toArray(children).find(isValidElement);

  if (
    !codeElement ||
    typeof codeElement.props !== 'object' ||
    !codeElement.props ||
    !('className' in codeElement.props)
  ) {
    return 'CODE';
  }

  return getCodeLanguageLabel(
    typeof codeElement.props.className === 'string' ? codeElement.props.className : undefined,
  );
}

const markdownComponents: Components = {
  table({ children }: ComponentPropsWithoutRef<'table'>) {
    return (
      <div className="markdown-table-scroll">
        <table>{children}</table>
      </div>
    );
  },
  pre({ children }) {
    return (
      <figure className="markdown-code-frame">
        <figcaption className="markdown-code-header">
          <span className="markdown-code-window-dots" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          <span className="markdown-code-language">{getCodeBlockLanguageLabel(children)}</span>
        </figcaption>
        <pre className="markdown-code-pre">{children}</pre>
      </figure>
    );
  },
  code({ children, className, node, ...props }) {
    void node;

    return (
      <code
        {...props}
        className={['markdown-code-text', className].filter(Boolean).join(' ')}
        data-language={getCodeLanguageLabel(className)}
      >
        {children}
      </code>
    );
  },
};

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
  showCardLabels,
  cardDensityId,
  cardTypographyScaleId,
  cardTypographyVoiceId,
  cardAccentId,
  cardBackgroundIntensityId,
  cardCornerRadiusId,
  cardCompositionId,
  cardTextureId,
  cardMoodId,
}: {
  markdown: string;
  preset: PlatformPreset;
  theme: CardTheme;
  isBlank: boolean;
  cardRef: React.RefObject<HTMLDivElement | null>;
  showCardLabels: boolean;
  cardDensityId: CardDensityId;
  cardTypographyScaleId: CardTypographyScaleId;
  cardTypographyVoiceId: CardTypographyVoiceId;
  cardAccentId: CardAccentId;
  cardBackgroundIntensityId: CardBackgroundIntensityId;
  cardCornerRadiusId: CardCornerRadiusId;
  cardCompositionId: CardCompositionId;
  cardTextureId: CardTextureId;
  cardMoodId: CardMoodId;
}) {
  const labelsVisible = shouldShowCardLabels(showCardLabels);

  return (
    <div
      ref={cardRef}
      className={getCardClassName(
        theme.className,
        preset.id,
        showCardLabels,
        cardDensityId,
        cardTypographyScaleId,
        cardTypographyVoiceId,
        cardBackgroundIntensityId,
        cardCornerRadiusId,
        cardCompositionId,
        cardTextureId,
        cardMoodId,
      )}
      style={{
        ...getCardAppearanceStyle(cardAccentId),
        aspectRatio: `${preset.width} / ${preset.height}`,
      } as CSSProperties}
    >
      <div className="card-chrome" aria-hidden={!labelsVisible}>
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
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
            {markdown}
          </ReactMarkdown>
        )}
      </div>
      <div className="card-footer" aria-hidden={!labelsVisible}>
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
          inset: `${guide.verticalMarginPercent}% ${guide.horizontalMarginPercent}%`,
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
    <details className="onboarding-checklist">
      <summary className="onboarding-heading">
        <PanelRightOpen size={18} />
        <div>
          <p className="eyebrow">Getting Started</p>
          <h2>60-second workflow</h2>
        </div>
      </summary>
      <div className="onboarding-content">
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
      </div>
    </details>
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
    const densityLabel =
      cardDensityOptions.find((item) => item.id === savedPreset.cardDensityId)?.label ?? savedPreset.cardDensityId;
    const typographyLabel =
      cardTypographyScaleOptions.find((item) => item.id === savedPreset.cardTypographyScaleId)?.label ??
      savedPreset.cardTypographyScaleId;
    const typographyVoiceLabel =
      cardTypographyVoiceOptions.find((item) => item.id === savedPreset.cardTypographyVoiceId)?.label ??
      savedPreset.cardTypographyVoiceId;
    const accentLabel =
      cardAccentOptions.find((item) => item.id === savedPreset.cardAccentId)?.label ?? savedPreset.cardAccentId;
    const backgroundIntensityLabel =
      cardBackgroundIntensityOptions.find((item) => item.id === savedPreset.cardBackgroundIntensityId)?.label ??
      savedPreset.cardBackgroundIntensityId;
    const cornerRadiusLabel =
      cardCornerRadiusOptions.find((item) => item.id === savedPreset.cardCornerRadiusId)?.label ??
      savedPreset.cardCornerRadiusId;
    const compositionLabel =
      cardCompositionOptions.find((item) => item.id === savedPreset.cardCompositionId)?.label ??
      savedPreset.cardCompositionId;
    const textureLabel =
      cardTextureOptions.find((item) => item.id === savedPreset.cardTextureId)?.label ?? savedPreset.cardTextureId;
    const moodLabel =
      cardMoodOptions.find((item) => item.id === savedPreset.cardMoodId)?.label ?? savedPreset.cardMoodId;
    const labelVisibility = savedPreset.showCardLabels ? 'Labels on' : 'Labels off';

    return `${platformLabel} · ${themeLabel} · ${densityLabel} · ${typographyLabel} · ${typographyVoiceLabel} · ${accentLabel} · ${backgroundIntensityLabel} · ${cornerRadiusLabel} · ${compositionLabel} · ${textureLabel} · ${moodLabel} · ${labelVisibility} · ${scaleLabel}`;
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

function CardConfigTransferPanel({
  recipeState,
  recipeMessage,
  fileInputRef,
  onExportRecipe,
  onChooseRecipeFile,
  onRecipeFileInputChange,
}: {
  recipeState: RecipeTransferState;
  recipeMessage: string;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onExportRecipe: () => void;
  onChooseRecipeFile: () => void;
  onRecipeFileInputChange: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className={`card-config-transfer ${recipeState}`}>
      <div className="card-config-transfer-copy">
        <strong>Share this card recipe</strong>
        <span>Export or import Markdown, platform, theme, appearance, composition, export quality, and labels.</span>
        {recipeMessage ? (
          <small className="card-config-transfer-status" aria-live="polite">
            {recipeState === 'error' ? <AlertCircle size={14} /> : <Check size={14} />}
            {recipeMessage}
          </small>
        ) : null}
      </div>
      <div className="card-config-transfer-actions">
        <button className="ghost-button" type="button" onClick={onExportRecipe}>
          <Download size={16} />
          Export JSON
        </button>
        <button className="ghost-button" type="button" onClick={onChooseRecipeFile} disabled={recipeState === 'importing'}>
          <Upload size={16} />
          {recipeState === 'importing' ? 'Importing...' : 'Import JSON'}
        </button>
      </div>
      <input
        ref={fileInputRef}
        className="file-input"
        type="file"
        accept=".json,application/json"
        onChange={onRecipeFileInputChange}
      />
    </div>
  );
}

function AppearanceControls({
  cardDensityId,
  cardTypographyScaleId,
  cardTypographyVoiceId,
  cardAccentId,
  cardBackgroundIntensityId,
  cardCornerRadiusId,
  cardCompositionId,
  cardTextureId,
  cardMoodId,
  onDensityChange,
  onTypographyScaleChange,
  onTypographyVoiceChange,
  onAccentChange,
  onBackgroundIntensityChange,
  onCornerRadiusChange,
  onCompositionChange,
  onTextureChange,
  onMoodChange,
}: {
  cardDensityId: CardDensityId;
  cardTypographyScaleId: CardTypographyScaleId;
  cardTypographyVoiceId: CardTypographyVoiceId;
  cardAccentId: CardAccentId;
  cardBackgroundIntensityId: CardBackgroundIntensityId;
  cardCornerRadiusId: CardCornerRadiusId;
  cardCompositionId: CardCompositionId;
  cardTextureId: CardTextureId;
  cardMoodId: CardMoodId;
  onDensityChange: (densityId: CardDensityId) => void;
  onTypographyScaleChange: (typographyScaleId: CardTypographyScaleId) => void;
  onTypographyVoiceChange: (typographyVoiceId: CardTypographyVoiceId) => void;
  onAccentChange: (accentId: CardAccentId) => void;
  onBackgroundIntensityChange: (backgroundIntensityId: CardBackgroundIntensityId) => void;
  onCornerRadiusChange: (cornerRadiusId: CardCornerRadiusId) => void;
  onCompositionChange: (compositionId: CardCompositionId) => void;
  onTextureChange: (textureId: CardTextureId) => void;
  onMoodChange: (moodId: CardMoodId) => void;
}) {
  return (
    <div className="appearance-controls">
      <div className="appearance-control-block">
        <span className="mini-label">Density</span>
        <div className="density-control">
          {cardDensityOptions.map((item) => (
            <button
              key={item.id}
              className={item.id === cardDensityId ? 'active' : ''}
              type="button"
              onClick={() => onDensityChange(item.id)}
              title={item.description}
            >
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="appearance-control-block">
        <span className="mini-label">Type Scale</span>
        <div className="typography-control">
          {cardTypographyScaleOptions.map((item) => (
            <button
              key={item.id}
              className={item.id === cardTypographyScaleId ? 'active' : ''}
              type="button"
              onClick={() => onTypographyScaleChange(item.id)}
              title={item.description}
            >
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="appearance-control-block">
        <span className="mini-label">Typography Voice</span>
        <div className="typography-voice-control">
          {cardTypographyVoiceOptions.map((item) => (
            <button
              key={item.id}
              className={item.id === cardTypographyVoiceId ? 'active' : ''}
              type="button"
              onClick={() => onTypographyVoiceChange(item.id)}
              title={item.description}
            >
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="appearance-control-block">
        <span className="mini-label">Accent</span>
        <div className="accent-control" aria-label="Accent color">
          {cardAccentOptions.map((item) => (
            <button
              key={item.id}
              className={item.id === cardAccentId ? 'active' : ''}
              type="button"
              onClick={() => onAccentChange(item.id)}
              title={`${item.label} accent`}
              aria-label={`${item.label} accent`}
            >
              <span className="accent-swatch" style={{ background: item.color }} aria-hidden="true" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="appearance-control-block">
        <span className="mini-label">Background Intensity</span>
        <div className="background-intensity-control">
          {cardBackgroundIntensityOptions.map((item) => (
            <button
              key={item.id}
              className={item.id === cardBackgroundIntensityId ? 'active' : ''}
              type="button"
              onClick={() => onBackgroundIntensityChange(item.id)}
              title={item.description}
            >
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="appearance-control-block">
        <span className="mini-label">Corners</span>
        <div className="corner-radius-control">
          {cardCornerRadiusOptions.map((item) => (
            <button
              key={item.id}
              className={item.id === cardCornerRadiusId ? 'active' : ''}
              type="button"
              onClick={() => onCornerRadiusChange(item.id)}
              title={item.description}
            >
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="appearance-control-block">
        <span className="mini-label">Composition</span>
        <div className="composition-control">
          {cardCompositionOptions.map((item) => (
            <button
              key={item.id}
              className={item.id === cardCompositionId ? 'active' : ''}
              type="button"
              onClick={() => onCompositionChange(item.id)}
              title={item.description}
            >
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="appearance-control-block">
        <span className="mini-label">Texture</span>
        <div className="texture-control">
          {cardTextureOptions.map((item) => (
            <button
              key={item.id}
              className={item.id === cardTextureId ? 'active' : ''}
              type="button"
              onClick={() => onTextureChange(item.id)}
              title={item.description}
            >
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="appearance-control-block">
        <span className="mini-label">Mood</span>
        <div className="mood-control">
          {cardMoodOptions.map((item) => (
            <button
              key={item.id}
              className={item.id === cardMoodId ? 'active' : ''}
              type="button"
              onClick={() => onMoodChange(item.id)}
              title={item.description}
            >
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function StylePackSelector({
  activeStylePackId,
  onApplyStylePack,
}: {
  activeStylePackId: StylePackId | null;
  onApplyStylePack: (stylePackId: StylePackId) => void;
}) {
  return (
    <div className="style-pack-selector">
      <p className="field-hint">
        Visual recipes change appearance only. Your Markdown, platform, and export quality stay intact.
      </p>
      <div className="style-pack-grid">
        {stylePacks.map((item) => {
          const themeLabel = cardThemes.find((themeItem) => themeItem.id === item.themeId)?.label ?? item.themeId;
          const accent = getCardAccentOption(item.cardAccentId);
          const density = getCardDensityOption(item.cardDensityId);
          const voice = getCardTypographyVoiceOption(item.cardTypographyVoiceId);
          const composition = getCardCompositionOption(item.cardCompositionId);
          const texture = getCardTextureOption(item.cardTextureId);
          const mood = getCardMoodOption(item.cardMoodId);

          return (
            <button
              key={item.id}
              className={item.id === activeStylePackId ? 'active' : ''}
              type="button"
              onClick={() => onApplyStylePack(item.id)}
            >
              <Palette size={15} />
              <span>{item.label}</span>
              <small>{item.description}</small>
              <span className="style-pack-setup">
                <span className="recipe-accent-dot" style={{ background: accent.color }} aria-hidden="true" />
                {themeLabel} · {density.label} · {voice.label} · {accent.label} · {composition.label} ·{' '}
                {texture.label} · {mood.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function RecipePresetSelector({
  activeRecipeId,
  onApplyRecipePreset,
}: {
  activeRecipeId: RecipePresetId | null;
  onApplyRecipePreset: (recipePresetId: RecipePresetId) => void;
}) {
  return (
    <div className="recipe-preset-grid">
      {recipePresets.map((item) => {
        const platformLabel = platformPresets.find((preset) => preset.id === item.presetId)?.label ?? item.presetId;
        const themeLabel = cardThemes.find((themeItem) => themeItem.id === item.themeId)?.label ?? item.themeId;
        const accent = getCardAccentOption(item.cardAccentId);
        const voice = getCardTypographyVoiceOption(item.cardTypographyVoiceId);
        const composition = getCardCompositionOption(item.cardCompositionId);
        const texture = getCardTextureOption(item.cardTextureId);
        const mood = getCardMoodOption(item.cardMoodId);

        return (
          <button
            key={item.id}
            className={item.id === activeRecipeId ? 'active' : ''}
            type="button"
            onClick={() => onApplyRecipePreset(item.id)}
          >
            <Palette size={15} />
            <span>{item.label}</span>
            <small>{item.description}</small>
            <span className="recipe-setup">
              <span className="recipe-accent-dot" style={{ background: accent.color }} aria-hidden="true" />
              {platformLabel} · {themeLabel} · {voice.label} · {accent.label} · {composition.label} ·{' '}
              {texture.label} · {mood.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function App() {
  const [markdown, setMarkdown] = useState(sampleMarkdown);
  const [presetId, setPresetId] = useState<PlatformPreset['id']>('twitter');
  const [themeId, setThemeId] = useState<CardTheme['id']>('signal');
  const [exportScaleId, setExportScaleId] = useState<ExportScaleId>(defaultExportScaleId);
  const [cardDensityId, setCardDensityId] = useState<CardDensityId>(defaultCardDensityId);
  const [cardTypographyScaleId, setCardTypographyScaleId] =
    useState<CardTypographyScaleId>(defaultCardTypographyScaleId);
  const [cardTypographyVoiceId, setCardTypographyVoiceId] =
    useState<CardTypographyVoiceId>(defaultCardTypographyVoiceId);
  const [cardAccentId, setCardAccentId] = useState<CardAccentId>(defaultCardAccentId);
  const [cardBackgroundIntensityId, setCardBackgroundIntensityId] =
    useState<CardBackgroundIntensityId>(defaultCardBackgroundIntensityId);
  const [cardCornerRadiusId, setCardCornerRadiusId] = useState<CardCornerRadiusId>(defaultCardCornerRadiusId);
  const [cardCompositionId, setCardCompositionId] = useState<CardCompositionId>(defaultCardCompositionId);
  const [cardTextureId, setCardTextureId] = useState<CardTextureId>(defaultCardTextureId);
  const [cardMoodId, setCardMoodId] = useState<CardMoodId>(defaultCardMoodId);
  const [activeTemplateId, setActiveTemplateId] = useState<TemplateId>('x-launch');
  const [activeRecipeId, setActiveRecipeId] = useState<RecipePresetId | null>(null);
  const [activeStylePackId, setActiveStylePackId] = useState<StylePackId | null>(null);
  const [showSafeAreaGuide, setShowSafeAreaGuide] = useState(true);
  const [showCardLabels, setShowCardLabels] = useState(true);
  const [exportState, setExportState] = useState<ExportState>('idle');
  const [starterCopyState, setStarterCopyState] = useState<StarterCopyState>('idle');
  const [importState, setImportState] = useState<ImportState>('idle');
  const [importMessage, setImportMessage] = useState('');
  const [isDraggingImport, setIsDraggingImport] = useState(false);
  const [fitMessage, setFitMessage] = useState('');
  const [presetName, setPresetName] = useState('');
  const [savedPresets, setSavedPresets] = useState<SavedCardPreset[]>(() => readSavedPresets());
  const [presetSaveState, setPresetSaveState] = useState<PresetSaveState>('idle');
  const [recipeState, setRecipeState] = useState<RecipeTransferState>('idle');
  const [recipeMessage, setRecipeMessage] = useState('');
  const [message, setMessage] = useState('Ready to export.');
  const cardRef = useRef<HTMLDivElement | null>(null);
  const markdownInputRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const recipeFileInputRef = useRef<HTMLInputElement | null>(null);

  const preset = useMemo(
    () => platformPresets.find((item) => item.id === presetId) ?? platformPresets[0],
    [presetId],
  );
  const theme = useMemo(() => cardThemes.find((item) => item.id === themeId) ?? cardThemes[0], [themeId]);
  const exportScale = useMemo(() => getExportScaleOption(exportScaleId), [exportScaleId]);
  const cardDensity = useMemo(() => getCardDensityOption(cardDensityId), [cardDensityId]);
  const cardTypographyScale = useMemo(
    () => getCardTypographyScaleOption(cardTypographyScaleId),
    [cardTypographyScaleId],
  );
  const cardTypographyVoice = useMemo(
    () => getCardTypographyVoiceOption(cardTypographyVoiceId),
    [cardTypographyVoiceId],
  );
  const cardAccent = useMemo(() => getCardAccentOption(cardAccentId), [cardAccentId]);
  const cardBackgroundIntensity = useMemo(
    () => getCardBackgroundIntensityOption(cardBackgroundIntensityId),
    [cardBackgroundIntensityId],
  );
  const cardCornerRadius = useMemo(() => getCardCornerRadiusOption(cardCornerRadiusId), [cardCornerRadiusId]);
  const cardComposition = useMemo(() => getCardCompositionOption(cardCompositionId), [cardCompositionId]);
  const cardTexture = useMemo(() => getCardTextureOption(cardTextureId), [cardTextureId]);
  const cardMood = useMemo(() => getCardMoodOption(cardMoodId), [cardMoodId]);
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
    setRecipeState('idle');
    setRecipeMessage('');
  }

  function applyTemplate(templateId: TemplateId) {
    const template = getMarkdownTemplate(templateId);

    setMarkdown(template.markdown);
    setPresetId(template.presetId);
    setThemeId(template.themeId);
    setActiveTemplateId(template.id);
    setActiveRecipeId(null);
    setActiveStylePackId(null);
    setMessage(`${template.label} loaded. Replace the text with your own Markdown when ready.`);
    setImportState('idle');
    setImportMessage('');
    resetEditorFeedback();
  }

  function applyRecipePreset(recipePresetId: RecipePresetId) {
    const recipePreset = getRecipePreset(recipePresetId);

    setMarkdown(recipePreset.markdown);
    setPresetId(recipePreset.presetId);
    setThemeId(recipePreset.themeId);
    setCardDensityId(recipePreset.cardDensityId);
    setCardTypographyScaleId(recipePreset.cardTypographyScaleId);
    setCardTypographyVoiceId(recipePreset.cardTypographyVoiceId);
    setCardAccentId(recipePreset.cardAccentId);
    setCardBackgroundIntensityId(recipePreset.cardBackgroundIntensityId);
    setCardCornerRadiusId(recipePreset.cardCornerRadiusId);
    setCardCompositionId(recipePreset.cardCompositionId);
    setCardTextureId(recipePreset.cardTextureId);
    setCardMoodId(recipePreset.cardMoodId);
    setShowCardLabels(recipePreset.showCardLabels);
    setActiveRecipeId(recipePreset.id);
    setActiveStylePackId(null);
    setPresetName('');
    setMessage(`${recipePreset.label} recipe applied. Preview and exports now use this visual setup.`);
    setImportState('idle');
    setImportMessage('');
    resetEditorFeedback();
  }

  function applyStylePack(stylePackId: StylePackId) {
    const stylePack = getStylePack(stylePackId);
    const appearance = applyStylePackAppearance({}, stylePack.id);

    setThemeId(appearance.themeId);
    setCardDensityId(appearance.cardDensityId);
    setCardTypographyScaleId(appearance.cardTypographyScaleId);
    setCardTypographyVoiceId(appearance.cardTypographyVoiceId);
    setCardAccentId(appearance.cardAccentId);
    setCardBackgroundIntensityId(appearance.cardBackgroundIntensityId);
    setCardCornerRadiusId(appearance.cardCornerRadiusId);
    setCardCompositionId(appearance.cardCompositionId);
    setCardTextureId(appearance.cardTextureId);
    setCardMoodId(appearance.cardMoodId);
    setShowCardLabels(appearance.showCardLabels);
    setActiveStylePackId(stylePack.id);
    setActiveRecipeId(null);
    setPresetName('');
    setMessage(`${stylePack.label} style pack applied. Your Markdown, platform, and export quality stayed unchanged.`);
    setImportState('idle');
    setImportMessage('');
    resetEditorFeedback();
  }

  function startBlankMarkdown() {
    setMarkdown('');
    setActiveRecipeId(null);
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
        cardDensityId: cardDensity.id,
        cardTypographyScaleId: cardTypographyScale.id,
        cardTypographyVoiceId: cardTypographyVoice.id,
        cardAccentId: cardAccent.id,
        cardBackgroundIntensityId: cardBackgroundIntensity.id,
        cardCornerRadiusId: cardCornerRadius.id,
        cardCompositionId: cardComposition.id,
        cardTextureId: cardTexture.id,
        cardMoodId: cardMood.id,
        showCardLabels,
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
    setCardDensityId(savedPreset.cardDensityId);
    setCardTypographyScaleId(savedPreset.cardTypographyScaleId);
    setCardTypographyVoiceId(savedPreset.cardTypographyVoiceId);
    setCardAccentId(savedPreset.cardAccentId);
    setCardBackgroundIntensityId(savedPreset.cardBackgroundIntensityId);
    setCardCornerRadiusId(savedPreset.cardCornerRadiusId);
    setCardCompositionId(savedPreset.cardCompositionId);
    setCardTextureId(savedPreset.cardTextureId);
    setCardMoodId(savedPreset.cardMoodId);
    setShowCardLabels(savedPreset.showCardLabels);
    setPresetName(savedPreset.name);
    setActiveRecipeId(null);
    setActiveStylePackId(null);
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

  function getCardConfigFileName(): string {
    const baseName = title
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 64);

    return `${baseName || 'md2cards'}-${preset.id}-recipe.json`;
  }

  function handleExportCardConfig() {
    try {
      const recipeJson = serializeCardConfig({
        markdown,
        presetId: preset.id,
        themeId: theme.id,
        exportScaleId: exportScale.id,
        cardDensityId: cardDensity.id,
        cardTypographyScaleId: cardTypographyScale.id,
        cardTypographyVoiceId: cardTypographyVoice.id,
        cardAccentId: cardAccent.id,
        cardBackgroundIntensityId: cardBackgroundIntensity.id,
        cardCornerRadiusId: cardCornerRadius.id,
        cardCompositionId: cardComposition.id,
        cardTextureId: cardTexture.id,
        cardMoodId: cardMood.id,
        showCardLabels,
      });
      const blob = new Blob([recipeJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.download = getCardConfigFileName();
      link.href = url;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 0);

      setRecipeState('success');
      setRecipeMessage('Recipe JSON exported.');
      setMessage('Card recipe JSON download started.');
      setExportState('idle');
      setPresetSaveState('idle');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unable to export this card recipe.';
      setRecipeState('error');
      setRecipeMessage(errorMessage);
      setMessage(errorMessage);
    }
  }

  async function importCardConfigFile(file: File | undefined) {
    resetEditorFeedback();

    if (!file) {
      return;
    }

    const validation = validateCardConfigImportFile(file);
    if (!validation.valid) {
      setRecipeState('error');
      setRecipeMessage(validation.message);
      setMessage(validation.message);
      return;
    }

    try {
      setRecipeState('importing');
      setRecipeMessage(`Importing ${file.name}...`);
      setMessage(`Reading ${file.name}...`);

      const importedRecipe = parseCardConfigJson(await file.text());
      if (!importedRecipe.valid) {
        setRecipeState('error');
        setRecipeMessage(importedRecipe.message);
        setMessage(importedRecipe.message);
        return;
      }

      setMarkdown(importedRecipe.config.markdown);
      setPresetId(importedRecipe.config.presetId);
      setThemeId(importedRecipe.config.themeId);
      setExportScaleId(importedRecipe.config.exportScaleId);
      setCardDensityId(importedRecipe.config.cardDensityId);
      setCardTypographyScaleId(importedRecipe.config.cardTypographyScaleId);
      setCardTypographyVoiceId(importedRecipe.config.cardTypographyVoiceId);
      setCardAccentId(importedRecipe.config.cardAccentId);
      setCardBackgroundIntensityId(importedRecipe.config.cardBackgroundIntensityId);
      setCardCornerRadiusId(importedRecipe.config.cardCornerRadiusId);
      setCardCompositionId(importedRecipe.config.cardCompositionId);
      setCardTextureId(importedRecipe.config.cardTextureId);
      setCardMoodId(importedRecipe.config.cardMoodId);
      setShowCardLabels(importedRecipe.config.showCardLabels);
      setActiveRecipeId(null);
      setActiveStylePackId(null);
      setImportState('idle');
      setImportMessage('');
      setRecipeState('success');
      setRecipeMessage(`Imported ${file.name}.`);
      setMessage(`Imported ${file.name}. Card recipe loaded and preview updated.`);
      window.setTimeout(() => markdownInputRef.current?.focus(), 0);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unable to read this recipe file.';
      setRecipeState('error');
      setRecipeMessage(errorMessage);
      setMessage(errorMessage);
    }
  }

  function handleChooseRecipeFile() {
    recipeFileInputRef.current?.click();
  }

  function handleRecipeFileInputChange(event: ChangeEvent<HTMLInputElement>) {
    void importCardConfigFile(event.target.files?.[0]);
    event.target.value = '';
  }

  function handleFitMarkdown() {
    const result = fitMarkdownToPreset(markdown, preset);

    if (result.changed) {
      setMarkdown(result.markdown);
      setActiveRecipeId(null);
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
      setActiveRecipeId(null);
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
              <label htmlFor="markdown-input">Markdown</label>
              <div className="editor-actions">
                <button className="ghost-button" type="button" onClick={startBlankMarkdown}>
                  <FileCode2 size={16} />
                  Start Blank
                </button>
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
            <textarea
              id="markdown-input"
              ref={markdownInputRef}
              value={markdown}
              onChange={(event) => {
                setMarkdown(event.target.value);
                setActiveRecipeId(null);
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
                    setActiveRecipeId(null);
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
                  onClick={() => {
                    setThemeId(item.id);
                    setActiveRecipeId(null);
                    setActiveStylePackId(null);
                    setMessage(`${item.label} theme selected. Preview and exports updated.`);
                  }}
                  title={item.description}
                >
                  <span className="swatch" aria-hidden="true" />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="field-group">
            <span className="field-label">Visual Recipe</span>
            <StylePackSelector activeStylePackId={activeStylePackId} onApplyStylePack={applyStylePack} />
          </div>

          <div className="field-group">
            <span className="field-label">Appearance</span>
            <AppearanceControls
              cardDensityId={cardDensity.id}
              cardTypographyScaleId={cardTypographyScale.id}
              cardTypographyVoiceId={cardTypographyVoice.id}
              cardAccentId={cardAccent.id}
              cardBackgroundIntensityId={cardBackgroundIntensity.id}
              cardCornerRadiusId={cardCornerRadius.id}
              cardCompositionId={cardComposition.id}
              cardTextureId={cardTexture.id}
              cardMoodId={cardMood.id}
              onDensityChange={(densityId) => {
                setCardDensityId(densityId);
                setActiveRecipeId(null);
                setActiveStylePackId(null);
                setMessage(`${getCardDensityOption(densityId).label} density selected. Preview and exports updated.`);
              }}
              onTypographyScaleChange={(typographyScaleId) => {
                setCardTypographyScaleId(typographyScaleId);
                setActiveRecipeId(null);
                setActiveStylePackId(null);
                setMessage(
                  `${getCardTypographyScaleOption(typographyScaleId).label} type scale selected. Preview and exports updated.`,
                );
              }}
              onTypographyVoiceChange={(typographyVoiceId) => {
                setCardTypographyVoiceId(typographyVoiceId);
                setActiveRecipeId(null);
                setActiveStylePackId(null);
                setMessage(
                  `${getCardTypographyVoiceOption(typographyVoiceId).label} typography voice selected. Preview and exports updated.`,
                );
              }}
              onAccentChange={(accentId) => {
                setCardAccentId(accentId);
                setActiveRecipeId(null);
                setActiveStylePackId(null);
                setMessage(`${getCardAccentOption(accentId).label} accent selected. Preview and exports updated.`);
              }}
              onBackgroundIntensityChange={(backgroundIntensityId) => {
                setCardBackgroundIntensityId(backgroundIntensityId);
                setActiveRecipeId(null);
                setActiveStylePackId(null);
                setMessage(
                  `${getCardBackgroundIntensityOption(backgroundIntensityId).label} background intensity selected. Preview and exports updated.`,
                );
              }}
              onCornerRadiusChange={(cornerRadiusId) => {
                setCardCornerRadiusId(cornerRadiusId);
                setActiveRecipeId(null);
                setActiveStylePackId(null);
                setMessage(
                  `${getCardCornerRadiusOption(cornerRadiusId).label} corners selected. Preview and exports updated.`,
                );
              }}
              onCompositionChange={(compositionId) => {
                setCardCompositionId(compositionId);
                setActiveRecipeId(null);
                setActiveStylePackId(null);
                setMessage(
                  `${getCardCompositionOption(compositionId).label} composition selected. Preview and exports updated.`,
                );
              }}
              onTextureChange={(textureId) => {
                setCardTextureId(textureId);
                setActiveRecipeId(null);
                setActiveStylePackId(null);
                setMessage(`${getCardTextureOption(textureId).label} texture selected. Preview and exports updated.`);
              }}
              onMoodChange={(moodId) => {
                setCardMoodId(moodId);
                setActiveRecipeId(null);
                setActiveStylePackId(null);
                setMessage(`${getCardMoodOption(moodId).label} mood selected. Preview and exports updated.`);
              }}
            />
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
            <span className="field-label">Import Markdown</span>
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
          </div>

          <div className="field-group">
            <span className="field-label">Paste-Ready Examples</span>
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
            <span className="field-label">Recipe Presets</span>
            <RecipePresetSelector activeRecipeId={activeRecipeId} onApplyRecipePreset={applyRecipePreset} />
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

          <div className="field-group">
            <span className="field-label">Recipe JSON</span>
            <CardConfigTransferPanel
              recipeState={recipeState}
              recipeMessage={recipeMessage}
              fileInputRef={recipeFileInputRef}
              onExportRecipe={handleExportCardConfig}
              onChooseRecipeFile={handleChooseRecipeFile}
              onRecipeFileInputChange={handleRecipeFileInputChange}
            />
          </div>
        </aside>

        <section className="preview-panel" aria-label="Live card preview">
          <div className="preview-toolbar">
            <div className="preview-heading">
              <p className="eyebrow">Live Preview</p>
              <h2>{title}</h2>
            </div>
            <div className="preview-controls" aria-label="Preview controls">
              <div className="preview-toggles" aria-label="Preview guides">
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
                    <ShieldCheck size={15} />
                  </span>
                  <span className="guide-toggle-copy">
                    <strong>Safe area</strong>
                    <small>Platform crop guide</small>
                  </span>
                </label>
                <label className="guide-toggle">
                  <input
                    type="checkbox"
                    checked={showCardLabels}
                    onChange={(event) => {
                      setShowCardLabels(event.target.checked);
                      setActiveRecipeId(null);
                      setActiveStylePackId(null);
                      setExportState('idle');
                      setMessage(
                        event.target.checked
                          ? 'Card labels shown. Exports include the header and footer metadata.'
                          : 'Card labels hidden. Exports hide the header and footer labels.',
                      );
                    }}
                  />
                  <span className="toggle-box" aria-hidden="true">
                    <Tags size={15} />
                  </span>
                  <span className="guide-toggle-copy">
                    <strong>Card labels</strong>
                    <small>Header and footer</small>
                  </span>
                </label>
              </div>
              <div className="export-actions">
                <a
                  className="github-star-link"
                  href="https://github.com/junbuilds96/md2cards"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Star MD2Cards on GitHub"
                >
                  <Github size={18} />
                  Star on GitHub
                </a>
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
                  showCardLabels={showCardLabels}
                  cardDensityId={cardDensity.id}
                  cardTypographyScaleId={cardTypographyScale.id}
                  cardTypographyVoiceId={cardTypographyVoice.id}
                  cardAccentId={cardAccent.id}
                  cardBackgroundIntensityId={cardBackgroundIntensity.id}
                  cardCornerRadiusId={cardCornerRadius.id}
                  cardCompositionId={cardComposition.id}
                  cardTextureId={cardTexture.id}
                  cardMoodId={cardMood.id}
                />
              </div>
              {showSafeAreaGuide ? <SafeAreaOverlay preset={preset} guide={safeAreaGuide} /> : null}
            </div>
          </div>

          <div
            className={`status-line ${
              exportState === 'error' || importState === 'error' || recipeState === 'error' ? 'error' : ''
            }`}
            role="status"
          >
            <span>{message}</span>
            <span>
              {theme.label} · {cardDensity.label} · {cardTypographyScale.label} type · {cardTypographyVoice.label} ·{' '}
              {cardAccent.label} · {cardBackgroundIntensity.label} · {cardCornerRadius.label} corners ·{' '}
              {cardComposition.label} · {cardTexture.label} texture · {cardMood.label} mood · {preset.sizeLabel} · Export{' '}
              {exportPixelSize.width} x {exportPixelSize.height}px
            </span>
          </div>
        </section>
      </section>
    </main>
  );
}

export default App;
