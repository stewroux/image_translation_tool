import React, { useState, useEffect } from 'react';

export interface ExportSettings {
  filename: string;
  width: number;
  height: number;
  dpi: number;
}

interface SizePreset {
  name: string;
  width: number;
  height: number;
  isCustom?: boolean;
}

interface ExportSettingsProps {
  settings: ExportSettings;
  onSettingsChange: (settings: ExportSettings) => void;
  onExport: () => void;
  isGeneratingFilename: boolean;
}

const DEFAULT_PRESET_SIZES: SizePreset[] = [
  { name: 'オリジナル', width: 0, height: 0 },
  { name: 'HD (1280x720)', width: 1280, height: 720 },
  { name: 'Full HD (1920x1080)', width: 1920, height: 1080 },
  { name: '4K (3840x2160)', width: 3840, height: 2160 },
  { name: 'Instagram正方形 (1080x1080)', width: 1080, height: 1080 },
  { name: 'Twitter画像 (1200x675)', width: 1200, height: 675 },
];

const STORAGE_KEY = 'image-translator-custom-presets';

export const ExportSettings: React.FC<ExportSettingsProps> = ({
  settings,
  onSettingsChange,
  onExport,
  isGeneratingFilename
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [customPresets, setCustomPresets] = useState<SizePreset[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [isManualCustomSize, setIsManualCustomSize] = useState(false);

  // Load custom presets from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setCustomPresets(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load custom presets:', error);
      }
    }
  }, []);

  // Save custom presets to localStorage
  const saveCustomPresets = (presets: SizePreset[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
    setCustomPresets(presets);
  };

  const allPresets = [...DEFAULT_PRESET_SIZES, ...customPresets];

  const isCustomSize = () => {
    return isManualCustomSize;
  };

  const handleFilenameChange = (filename: string) => {
    onSettingsChange({ ...settings, filename });
  };

  const handleSizePresetChange = (preset: SizePreset) => {
    setIsManualCustomSize(false);
    onSettingsChange({
      ...settings,
      width: preset.width,
      height: preset.height
    });
  };

  const handleSavePreset = () => {
    if (!presetName.trim()) return;

    const newPreset: SizePreset = {
      name: presetName.trim(),
      width: settings.width,
      height: settings.height,
      isCustom: true
    };

    const updatedPresets = [...customPresets, newPreset];
    saveCustomPresets(updatedPresets);
    setPresetName('');
    setShowSaveDialog(false);
  };

  const handleDeletePreset = (presetToDelete: SizePreset) => {
    if (!presetToDelete.isCustom) return;

    const updatedPresets = customPresets.filter(p =>
      !(p.name === presetToDelete.name && p.width === presetToDelete.width && p.height === presetToDelete.height)
    );
    saveCustomPresets(updatedPresets);
  };

  const handleCustomSizeChange = (dimension: 'width' | 'height', value: string) => {
    // 空文字列の場合は0を設定、それ以外は数値に変換
    const numValue = value === '' ? 0 : parseInt(value) || 0;
    onSettingsChange({
      ...settings,
      [dimension]: Math.max(0, numValue)
    });
  };

  const handleDpiChange = (dpi: number) => {
    onSettingsChange({
      ...settings,
      dpi: Math.max(72, Math.min(1000, dpi))
    });
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-border-light dark:border-border-dark shadow-sm relative overflow-hidden space-y-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
      {/* Decorative top border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-indigo-500 to-purple-500" />

      <h3 className="text-xl font-bold flex items-center gap-3 text-slate-800 dark:text-slate-100">
        <span className="p-2 bg-primary/10 rounded-lg text-primary">
          <span className="material-icons-outlined">settings</span>
        </span>
        設定と保存
      </h3>

      <div className="space-y-5">
        {/* ファイル名設定 */}
        <div className="group">
          <label className="block text-xs font-semibold tracking-wide text-slate-500 dark:text-slate-400 uppercase mb-2 group-focus-within:text-primary transition-colors">
            ファイル名
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={settings.filename}
              onChange={(e) => handleFilenameChange(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-white rounded-xl border border-border-light dark:border-slate-700 focus:ring-2 focus:ring-primary/50 focus:border-primary focus:outline-none transition-all placeholder-slate-400 dark:placeholder-slate-500"
              placeholder="ファイル名を入力"
              disabled={isGeneratingFilename}
            />
            <span className="text-slate-500 dark:text-slate-400 font-medium px-2">.png</span>
          </div>
          {isGeneratingFilename && (
            <p className="text-xs text-indigo-400 mt-2 flex items-center gap-1.5 animate-pulse">
              <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" fill="currentColor" className="opacity-75" />
              </svg>
              AIが最適に命名中...
            </p>
          )}
        </div>

        {/* サイズプリセット */}
        <div className="group">
          <label className="block text-xs font-semibold tracking-wide text-slate-500 dark:text-slate-400 uppercase mb-2 group-focus-within:text-primary transition-colors">
            出力サイズ
          </label>
          <div className="relative">
            <select
              value={
                isManualCustomSize
                  ? 'custom'
                  : settings.width === 0 && settings.height === 0
                    ? 'original'
                    : `${settings.width}x${settings.height}`
              }
              onChange={(e) => {
                if (e.target.value === 'original') {
                  handleSizePresetChange(DEFAULT_PRESET_SIZES[0]);
                } else if (e.target.value === 'custom') {
                  setIsManualCustomSize(true);
                  if (settings.width === 0 && settings.height === 0) {
                    onSettingsChange({ ...settings, width: 1920, height: 1080 });
                  }
                } else {
                  const preset = allPresets.find(p => `${p.width}x${p.height}` === e.target.value);
                  if (preset) handleSizePresetChange(preset);
                }
              }}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-white rounded-xl border border-border-light dark:border-slate-700 focus:ring-2 focus:ring-primary/50 focus:border-primary focus:outline-none transition-all appearance-none cursor-pointer pr-10"
            >
              <optgroup label="デフォルトサイズ" className="bg-white dark:bg-slate-800">
                {DEFAULT_PRESET_SIZES.map((preset) => (
                  <option key={`${preset.name}-${preset.width}x${preset.height}`} value={preset.width === 0 ? 'original' : `${preset.width}x${preset.height}`}>
                    {preset.name}
                  </option>
                ))}
              </optgroup>

              {customPresets.length > 0 && (
                <optgroup label="保存したカスタムサイズ" className="bg-white dark:bg-slate-800">
                  {customPresets.map((preset) => (
                    <option key={`custom-${preset.name}-${preset.width}x${preset.height}`} value={`${preset.width}x${preset.height}`}>
                      {preset.name}
                    </option>
                  ))}
                </optgroup>
              )}

              <option value="custom" className="bg-white dark:bg-slate-800 font-semibold text-primary">カスタムサイズを設定...</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500 dark:text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>

        {/* カスタムプリセット管理 */}
        {customPresets.length > 0 && (
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-border-light dark:border-slate-700/50">
            <label className="block text-[10px] font-semibold tracking-wider text-slate-500 uppercase mb-2 px-1">
              保存済みカスタム設定
            </label>
            <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
              {customPresets.map((preset) => (
                <div key={`${preset.name}-${preset.width}x${preset.height}`} className="flex items-center justify-between bg-white dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 px-3 py-1.5 rounded-lg text-sm transition-colors border border-border-light/50 dark:border-slate-600/30">
                  <span className="text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <svg className="w-3 h-3 text-primary" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                    {preset.name} <span className="text-slate-500 text-xs ml-1">({preset.width}x{preset.height})</span>
                  </span>
                  <button
                    onClick={() => handleDeletePreset(preset)}
                    className="text-slate-500 hover:text-red-400 p-1 rounded-md hover:bg-slate-600 transition-colors"
                    title="削除"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* カスタムサイズ入力 */}
        {isCustomSize() && (
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-primary/20 space-y-4 animate-fade-in-up">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                  幅 <span className="text-slate-400 dark:text-slate-500 text-[10px] uppercase">(px)</span>
                </label>
                <input
                  type="number"
                  value={settings.width === 0 ? '' : settings.width}
                  onChange={(e) => handleCustomSizeChange('width', e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900/50 text-slate-800 dark:text-white rounded-lg border border-border-light dark:border-slate-600/50 focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none transition-all text-sm"
                  min="1"
                  placeholder="幅を入力"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                  高さ <span className="text-slate-400 dark:text-slate-500 text-[10px] uppercase">(px)</span>
                </label>
                <input
                  type="number"
                  value={settings.height === 0 ? '' : settings.height}
                  onChange={(e) => handleCustomSizeChange('height', e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900/50 text-slate-800 dark:text-white rounded-lg border border-border-light dark:border-slate-600/50 focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none transition-all text-sm"
                  min="1"
                  placeholder="高さを入力"
                />
              </div>
            </div>

            {/* プリセット保存ボタン */}
            {settings.width > 0 && settings.height > 0 && (
              <div className="pt-2">
                {!showSaveDialog ? (
                  <button
                    onClick={() => setShowSaveDialog(true)}
                    className="w-full flex justify-center items-center gap-2 py-2 text-primary bg-primary/10 hover:bg-primary/20 text-xs font-medium rounded-lg border border-primary/20 hover:border-primary/40 transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path></svg>
                    このサイズをプリセットに保存
                  </button>
                ) : (
                  <div className="space-y-3 p-3 bg-white dark:bg-slate-900/50 rounded-lg border border-border-light dark:border-slate-700/50 animate-fade-in">
                    <div>
                      <label className="block text-[10px] font-medium text-slate-500 dark:text-slate-400 mb-1.5">プリセット名</label>
                      <input
                        type="text"
                        value={presetName}
                        onChange={(e) => setPresetName(e.target.value)}
                        placeholder="例: 私のブログ用"
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white rounded-lg border border-border-light dark:border-slate-600 focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none text-sm"
                        onKeyPress={(e) => e.key === 'Enter' && handleSavePreset()}
                        autoFocus
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleSavePreset}
                        disabled={!presetName.trim()}
                        className="flex-1 py-1.5 bg-primary text-white text-xs font-medium rounded-md shadow-sm hover:bg-primary-hover disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:text-slate-500 disabled:shadow-none transition-all"
                      >
                        保存
                      </button>
                      <button
                        onClick={() => {
                          setShowSaveDialog(false);
                          setPresetName('');
                        }}
                        className="flex-1 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium rounded-md hover:bg-slate-200 dark:hover:bg-slate-600 transition-all border border-border-light dark:border-slate-600/50"
                      >
                        キャンセル
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 詳細設定 */}
        <div className="pt-2 border-t border-border-light dark:border-slate-700/50">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors w-full group mt-2"
          >
            <span className="material-icons-outlined text-sm">tune</span>
            高度な設定 (DPI等)
          </button>

          {showAdvanced && (
            <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-border-light dark:border-slate-700/50 animate-fade-in-up">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  解像度 <span className="text-slate-400 dark:text-slate-500 uppercase ml-1">(DPI)</span>
                </label>
                <span className="text-sm font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">{settings.dpi}</span>
              </div>

              <div className="relative py-2">
                <input
                  type="range"
                  min="72"
                  max="1000"
                  step="1"
                  value={settings.dpi}
                  onChange={(e) => handleDpiChange(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
              <div className="flex justify-between text-[10px] font-medium text-slate-500 mt-1 px-1">
                <span>Web用 (72)</span>
                <span>印刷用 (300)</span>
                <span>最高画質 (1000)</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* エクスポートボタン */}
      <div className="pt-4 pb-2">
        <button
          onClick={onExport}
          className="w-full relative group overflow-hidden rounded-xl"
        >
          {/* Animated background glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 opacity-90 group-hover:opacity-100 transition-opacity duration-500" />

          <div className="relative px-6 py-4 text-white font-bold text-lg flex items-center justify-center gap-3 transform group-hover:-translate-y-0.5 transition-all duration-300">
            <span className="material-icons-outlined animate-bounce">download</span>
            画像を保存
          </div>
        </button>
        <p className="text-center text-[10px] text-slate-500 mt-3 font-medium">
          ※保存された画像はローカル環境のみに保存されます
        </p>
      </div>
    </div>
  );
};