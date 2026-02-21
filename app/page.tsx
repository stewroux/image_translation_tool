"use client";

import React from 'react';
import { useState, useEffect } from 'react';
import { ImageUploader } from '../components/ImageUploader';
import { ResultDisplay } from '../components/ResultDisplay';
import { ProgressBar } from '../components/ProgressBar';
import { SettingsModal } from '../components/SettingsModal';
import { translateImageText, generateImageSummary } from '../services/geminiService';
import { TranslationBlock } from '../types';
import { TranslateIcon } from '../components/icons';

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // remove data:mime/type;base64, prefix
      resolve(result.split(',')[1]);
    }
    reader.onerror = (error) => reject(error);
  });

export default function App() {
  const [originalImageFile, setOriginalImageFile] = useState<File | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [translations, setTranslations] = useState<TranslationBlock[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [defaultFilename, setDefaultFilename] = useState<string>('翻訳済み画像');
  const [isGeneratingFilename, setIsGeneratingFilename] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [progressMessage, setProgressMessage] = useState<string>('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [geminiKey, setGeminiKey] = useState<string>('');
  const [gcpProjectId, setGcpProjectId] = useState<string>('');

  useEffect(() => {
    setGeminiKey(localStorage.getItem('gemini_api_key') || '');
    setGcpProjectId(localStorage.getItem('gcp_project_id') || '');
  }, []);

  const handleSaveSettings = (key: string, projectId: string) => {
    setGeminiKey(key);
    setGcpProjectId(projectId);
    localStorage.setItem('gemini_api_key', key);
    localStorage.setItem('gcp_project_id', projectId);
  };

  const isApiReady = Boolean(process.env.NEXT_PUBLIC_GEMINI_API_KEY) || Boolean(geminiKey);

  const handleImageSelect = async (file: File) => {
    setOriginalImageFile(file);
    setOriginalImageUrl(URL.createObjectURL(file));
    setTranslations(null);
    setError(null);

    // Generate filename in background
    setIsGeneratingFilename(true);
    try {
      const base64Image = await fileToBase64(file);
      const summary = await generateImageSummary(base64Image, file.type, geminiKey);
      setDefaultFilename(summary);
    } catch (err) {
      console.error('Failed to generate filename:', err);
      setDefaultFilename('翻訳済み画像');
    } finally {
      setIsGeneratingFilename(false);
    }
  };

  const handleTranslate = async () => {
    if (!originalImageFile) {
      setError("最初に画像を選択してください。");
      return;
    }

    if (!isApiReady) {
      setError("APIキーが設定されていません。右上の設定(⚙)からGemini APIキーを設定してください。");
      setIsSettingsOpen(true);
      return;
    }

    setIsLoading(true);
    setError(null);
    setTranslations(null);
    setProgress(0);

    try {
      // Step 1: 画像をBase64に変換
      setProgressMessage("画像を処理中...");
      setProgress(20);
      const base64Image = await fileToBase64(originalImageFile);

      // Step 2: OCRと翻訳を実行
      setProgressMessage("AIが画像を分析中...");
      setProgress(40);

      // 少し遅延を追加して進捗を見やすくする
      await new Promise(resolve => setTimeout(resolve, 500));
      setProgress(60);

      setProgressMessage("日本語テキストを検出中...");
      setProgress(80);

      const apiTranslations = await translateImageText(base64Image, originalImageFile.type, geminiKey);

      setProgressMessage("翻訳を完了中...");
      setProgress(100);

      if (apiTranslations.length === 0) {
        setError("画像内に日本語のテキストが見つかりませんでした。");
        setIsLoading(false);
        return;
      }

      // 完了まで少し待つ
      await new Promise(resolve => setTimeout(resolve, 300));
      setTranslations(apiTranslations);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "不明なエラーが発生しました。";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      setProgress(0);
      setProgressMessage('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center p-4 sm:p-8 selection:bg-indigo-500/30 font-sans">
      {/* Decorative background blur elements */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-600/10 blur-[120px] pointer-events-none" />

      <main className="w-full max-w-5xl mx-auto bg-slate-800/40 rounded-3xl shadow-2xl backdrop-blur-xl border border-slate-700/50 relative z-10 overflow-hidden">
        {/* Subtle top highlight for glassmorphism */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-500/50 to-transparent" />

        <div className="p-8 md:p-14 relative">
          {/* Settings Button */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="absolute top-6 right-6 p-2.5 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-700/80 rounded-full transition-all border border-slate-700/50 hover:border-slate-600 shadow-sm hover:shadow-md group flex items-center gap-2"
            title="API設定"
          >
            {!isApiReady && (
              <span className="flex h-2.5 w-2.5 absolute top-1 right-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
              </span>
            )}
            <svg className="w-5 h-5 group-hover:rotate-45 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>

          <header className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 drop-shadow-sm pb-2 animate-fade-in-up">
              画像日本語翻訳ツール
            </h1>
            <p className="mt-4 text-lg md:text-xl text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
              日本語のテキストが含まれる画像をアップロードすると、AIがレイアウトを保ったまま英語に翻訳します。
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-stretch">
            <div className="flex flex-col w-full bg-slate-900/40 p-6 md:p-8 rounded-2xl border border-slate-700/50 shadow-inner">
              <h2 className="text-xl font-bold text-slate-100 mb-6 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 text-sm">1</span>
                画像をアップロード
              </h2>
              <div className="flex-1 flex flex-col">
                <ImageUploader onImageSelect={handleImageSelect} previewUrl={originalImageUrl} />
              </div>
            </div>

            <div className="flex flex-col w-full bg-slate-900/40 p-6 md:p-8 rounded-2xl border border-slate-700/50 shadow-inner mt-8 md:mt-0 relative overflow-hidden group">
              {/* Subtle hover effect background */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none" />

              <h2 className="text-xl font-bold text-slate-100 mb-6 flex items-center gap-3 relative z-10">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 text-sm">2</span>
                翻訳を実行
              </h2>
              <div className="flex-1 flex flex-col items-center justify-center text-center relative z-10">
                <p className="text-slate-400 mb-8 text-sm md:text-base leading-relaxed">
                  画像を選択したら、以下のボタンをクリックしてAI翻訳を開始します。<br />
                  <span className="text-slate-500 text-xs mt-2 block">※大きめの画像の場合、数十秒かかることがあります。</span>
                </p>
                <button
                  onClick={handleTranslate}
                  disabled={!originalImageFile || isLoading}
                  className="w-full max-w-sm px-8 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 disabled:bg-slate-700 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-400 disabled:shadow-none disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-slate-900 transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02] disabled:hover:translate-y-0 disabled:hover:scale-100 flex items-center justify-center gap-3 text-lg relative overflow-hidden group/btn"
                >
                  {/* Button shine effect */}
                  <div className="absolute inset-0 -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent z-0 disabled:hidden" />

                  <span className="relative z-10 flex items-center justify-center gap-3">
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        翻訳中...
                      </>
                    ) : (
                      <>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                        </svg>
                        画像を翻訳
                      </>
                    )}
                  </span>
                </button>
                {error && (
                  <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg w-full animate-fade-in">
                    <p className="text-red-400 text-sm font-medium">{error}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 進捗バー */}
          {isLoading && (
            <div className="mt-10 flex justify-center animate-fade-in-up">
              <ProgressBar
                progress={progress}
                message={progressMessage}
                isVisible={isLoading}
              />
            </div>
          )}

          {translations && !isLoading && (
            <div className="mt-16 pt-12 border-t border-slate-700/50 animate-fade-in-up">
              <ResultDisplay
                originalImageUrl={originalImageUrl!}
                initialTranslations={translations}
                defaultFilename={defaultFilename}
                isGeneratingFilename={isGeneratingFilename}
              />
            </div>
          )}
        </div>
      </main>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSaveSettings}
        initialGeminiKey={geminiKey}
        initialGcpProjectId={gcpProjectId}
      />

      {/* Global styles for custom animations */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        .animate-fade-in-up { animation: fade-in-up 0.6s ease-out forwards; }
        .animate-fade-in { animation: fade-in 0.4s ease-out forwards; }
      `}} />
    </div>
  );
}