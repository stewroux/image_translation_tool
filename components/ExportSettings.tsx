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
    <div className="bg-slate-700 p-6 rounded-lg space-y-4">
      <h3 className="text-lg font-semibold text-slate-200 mb-4">エクスポート設定</h3>

      {/* ファイル名設定 */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          ファイル名
        </label>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={settings.filename}
            onChange={(e) => handleFilenameChange(e.target.value)}
            className="flex-1 px-3 py-2 bg-slate-600 text-white rounded-md border border-slate-500 focus:border-indigo-500 focus:outline-none"
            placeholder="ファイル名を入力"
            disabled={isGeneratingFilename}
          />
          <span className="text-slate-400">.png</span>
        </div>
        {isGeneratingFilename && (
          <p className="text-sm text-indigo-400 mt-1">AIがファイル名を生成中...</p>
        )}
      </div>

      {/* サイズプリセット */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          出力サイズ
        </label>
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
              // カスタムサイズに切り替え
              setIsManualCustomSize(true);
              if (settings.width === 0 && settings.height === 0) {
                onSettingsChange({ ...settings, width: 1920, height: 1080 });
              }
            } else {
              const preset = allPresets.find(p => `${p.width}x${p.height}` === e.target.value);
              if (preset) handleSizePresetChange(preset);
            }
          }}
          className="w-full px-3 py-2 bg-slate-600 text-white rounded-md border border-slate-500 focus:border-indigo-500 focus:outline-none"
        >
          {allPresets.map((preset) => (
            <option key={`${preset.name}-${preset.width}x${preset.height}`} value={preset.width === 0 ? 'original' : `${preset.width}x${preset.height}`}>
              {preset.name} {preset.isCustom && '⭐'}
            </option>
          ))}
          <option value="custom">カスタムサイズ</option>
        </select>
      </div>

      {/* カスタムプリセット管理 */}
      {customPresets.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            カスタムプリセット管理
          </label>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {customPresets.map((preset) => (
              <div key={`${preset.name}-${preset.width}x${preset.height}`} className="flex items-center justify-between bg-slate-600 px-2 py-1 rounded text-sm">
                <span className="text-slate-200">{preset.name} ({preset.width}x{preset.height})</span>
                <button
                  onClick={() => handleDeletePreset(preset)}
                  className="text-red-400 hover:text-red-300 text-xs px-1"
                  title="削除"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* カスタムサイズ入力 */}
      {isCustomSize() && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                幅 (px)
              </label>
              <input
                type="number"
                value={settings.width === 0 ? '' : settings.width}
                onChange={(e) => handleCustomSizeChange('width', e.target.value)}
                className="w-full px-3 py-2 bg-slate-600 text-white rounded-md border border-slate-500 focus:border-indigo-500 focus:outline-none"
                min="1"
                placeholder="幅を入力"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                高さ (px)
              </label>
              <input
                type="number"
                value={settings.height === 0 ? '' : settings.height}
                onChange={(e) => handleCustomSizeChange('height', e.target.value)}
                className="w-full px-3 py-2 bg-slate-600 text-white rounded-md border border-slate-500 focus:border-indigo-500 focus:outline-none"
                min="1"
                placeholder="高さを入力"
              />
            </div>
          </div>

          {/* プリセット保存ボタン */}
          {settings.width > 0 && settings.height > 0 && (
            <div>
              {!showSaveDialog ? (
                <button
                  onClick={() => setShowSaveDialog(true)}
                  className="w-full px-3 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 transition-colors"
                >
                  このサイズをプリセットとして保存
                </button>
              ) : (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={presetName}
                    onChange={(e) => setPresetName(e.target.value)}
                    placeholder="プリセット名を入力"
                    className="w-full px-3 py-2 bg-slate-600 text-white rounded-md border border-slate-500 focus:border-indigo-500 focus:outline-none text-sm"
                    onKeyPress={(e) => e.key === 'Enter' && handleSavePreset()}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSavePreset}
                      disabled={!presetName.trim()}
                      className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:bg-slate-500 disabled:cursor-not-allowed transition-colors"
                    >
                      保存
                    </button>
                    <button
                      onClick={() => {
                        setShowSaveDialog(false);
                        setPresetName('');
                      }}
                      className="flex-1 px-3 py-2 bg-slate-600 text-white text-sm rounded-md hover:bg-slate-700 transition-colors"
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
      <div>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          {showAdvanced ? '詳細設定を隠す' : '詳細設定を表示'}
        </button>

        {showAdvanced && (
          <div className="mt-3">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              DPI ({settings.dpi})
            </label>
            <input
              type="range"
              min="72"
              max="1000"
              step="1"
              value={settings.dpi}
              onChange={(e) => handleDpiChange(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>72 (Web)</span>
              <span>300 (印刷)</span>
              <span>600 (高品質)</span>
              <span>1000 (最高品質)</span>
            </div>
          </div>
        )}
      </div>

      {/* エクスポートボタン */}
      <button
        onClick={onExport}
        className="w-full px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 focus:ring-offset-slate-700 transition-all transform hover:scale-105"
      >
        画像をダウンロード
      </button>
    </div>
  );
};