import React, { useState, useEffect } from 'react';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (geminiKey: string, gcpProjectId: string) => void;
    initialGeminiKey: string;
    initialGcpProjectId: string;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
    isOpen,
    onClose,
    onSave,
    initialGeminiKey,
    initialGcpProjectId
}) => {
    const [geminiKey, setGeminiKey] = useState('');
    const [gcpProjectId, setGcpProjectId] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // 環境変数が設定されているかどうかの判定フラグ
    const hasEnvGeminiKey = Boolean(process.env.NEXT_PUBLIC_GEMINI_API_KEY);
    const hasEnvGcpProjectId = Boolean(process.env.NEXT_PUBLIC_GOOGLE_CLOUD_PROJECT_ID);

    useEffect(() => {
        // モーダルが開かれた時に初期値をセット
        if (isOpen) {
            setGeminiKey(initialGeminiKey || '');
            setGcpProjectId(initialGcpProjectId || '');
            setShowPassword(false); // セキュリティのため都度リセット
        }
    }, [isOpen, initialGeminiKey, initialGcpProjectId]);

    if (!isOpen) return null;

    const handleSave = () => {
        onSave(geminiKey.trim(), gcpProjectId.trim());
        onClose();
    };

    const handleClear = () => {
        setGeminiKey('');
        setGcpProjectId('');
        onSave('', '');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm animate-fade-in">
            <div
                className="w-full max-w-md bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden animate-fade-in-up"
                onClick={(e) => e.stopPropagation()} // モーダル内のクリックで閉じないようにする
            >
                {/* Header */}
                <div className="px-6 py-4 flex items-center justify-between border-b border-slate-700/50 bg-slate-800/80">
                    <h3 className="text-xl font-bold flex items-center gap-2 text-slate-100">
                        <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        API設定
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-1 rounded-md hover:bg-slate-700">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                    <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-3 text-sm text-indigo-300">
                        独自のGemini APIキーを入力することで翻訳を利用できます。入力したキーはお使いのブラウザ内（ローカル）にのみ保存され、サーバーへ送信されることはありません。
                    </div>

                    <div className="space-y-4">
                        {/* Gemini API Key */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-1.5">
                                Gemini API Key
                            </label>
                            {hasEnvGeminiKey ? (
                                <div className="px-3 py-2 bg-slate-700/50 text-slate-400 rounded-lg border border-slate-600/50 text-sm">
                                    環境変数で設定されています
                                </div>
                            ) : (
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={geminiKey}
                                        onChange={(e) => setGeminiKey(e.target.value)}
                                        placeholder="AIzaSy..."
                                        className="w-full pl-3 pr-10 py-2.5 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 transition-all font-mono text-sm placeholder-slate-600"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-200"
                                    >
                                        {showPassword ? (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.29 3.29m0 0a10.05 10.05 0 015.71-3.292c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0l-3.29-3.29" /></svg>
                                        ) : (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Google Cloud Project ID (Optional) */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-1.5">
                                Google Cloud Project ID <span className="text-slate-500 font-normal ml-1">(オプション)</span>
                            </label>
                            {hasEnvGcpProjectId ? (
                                <div className="px-3 py-2 bg-slate-700/50 text-slate-400 rounded-lg border border-slate-600/50 text-sm">
                                    環境変数で設定されています
                                </div>
                            ) : (
                                <input
                                    type="text"
                                    value={gcpProjectId}
                                    onChange={(e) => setGcpProjectId(e.target.value)}
                                    placeholder="my-project-id"
                                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 transition-all font-mono text-sm placeholder-slate-600"
                                />
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-slate-900/50 border-t border-slate-700/50 flex items-center justify-between">
                    <button
                        onClick={handleClear}
                        className="text-sm text-red-400 hover:text-red-300 font-medium px-3 py-2 rounded-lg hover:bg-red-400/10 transition-colors"
                    >
                        設定をクリア
                    </button>

                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors border border-slate-600"
                        >
                            キャンセル
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-lg hover:shadow-indigo-500/25 transition-all"
                        >
                            保存
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
