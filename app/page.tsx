"use client";

import React, { useState, useEffect } from 'react';
import { ImageUploader } from '../components/ImageUploader';
import { ResultDisplay } from '../components/ResultDisplay';
import { ProgressBar } from '../components/ProgressBar';
import { SettingsModal } from '../components/SettingsModal';
import { translateImageText, generateImageSummary } from '../services/geminiService';
import { TranslationBlock } from '../types';

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
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
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  useEffect(() => {
    setGeminiKey(localStorage.getItem('gemini_api_key') || '');
    setGcpProjectId(localStorage.getItem('gcp_project_id') || '');

    // Check initial dark mode from localStorage or system theme
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

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
      setProgressMessage("画像を処理中...");
      setProgress(20);
      const base64Image = await fileToBase64(originalImageFile);

      setProgressMessage("AIが画像を分析中...");
      setProgress(40);
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

  const hasResults = Boolean(translations);

  // Landing Layout
  if (!hasResults && !isLoading) {
    return (
      <div className="bg-background-light dark:bg-background-dark min-h-screen flex text-slate-800 dark:text-slate-100 items-center justify-center p-4 transition-colors duration-300">
        <div className="fixed top-4 right-4 z-50">
          <button onClick={toggleDarkMode} className="p-2 rounded-full bg-white dark:bg-card-dark shadow-lg border border-border-light dark:border-border-dark text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <span className="material-icons-outlined">{isDarkMode ? 'light_mode' : 'brightness_6'}</span>
          </button>
        </div>
        <main className="w-full max-w-5xl bg-card-light dark:bg-card-dark rounded-2xl shadow-xl dark:shadow-2xl border border-border-light dark:border-border-dark overflow-hidden transition-colors duration-300 p-8 md:p-12 relative animate-fade-in-up">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-primary/10 dark:bg-primary/5 blur-3xl rounded-full pointer-events-none"></div>
          <header className="text-center mb-12 relative z-10">
            <div className="absolute top-0 right-0">
              <button onClick={() => setIsSettingsOpen(true)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors relative">
                {!isApiReady && (
                  <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                  </span>
                )}
                <span className="material-icons-outlined">settings</span>
              </button>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text pb-1">
              画像日本語翻訳ツール
            </h1>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed mt-2">
              日本語のテキストが含まれる画像をアップロードすると、AIがレイアウト<br className="hidden md:block" />
              を保ったまま英語に翻訳します。
            </p>
          </header>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
            <div className="bg-gray-50 dark:bg-[#151e2e] rounded-xl border border-border-light dark:border-border-dark p-6 flex flex-col h-full">
              <div className="flex items-center mb-6">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-xs font-bold mr-3">1</span>
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">画像をアップロード</h2>
              </div>
              <ImageUploader onImageSelect={handleImageSelect} previewUrl={originalImageUrl} />
            </div>

            <div className="bg-gray-50 dark:bg-[#151e2e] rounded-xl border border-border-light dark:border-border-dark p-6 flex flex-col h-full">
              <div className="flex items-center mb-6">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-bold mr-3">2</span>
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">翻訳を実行</h2>
              </div>
              <div className="flex-grow flex flex-col justify-center items-center text-center px-4">
                <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm leading-relaxed">
                  画像を選択したら、以下のボタンをクリックしてAI<br />
                  翻訳を開始します。
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-8">
                  ※大きめの画像の場合、数十秒かかることがあります。
                </p>
                <button
                  onClick={handleTranslate}
                  disabled={!originalImageFile}
                  className="w-full py-4 px-6 rounded-lg bg-slate-700 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-medium flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <span className="material-icons-outlined group-hover:animate-pulse">translate</span>
                  画像を翻訳
                </button>
              </div>
            </div>
          </div>
        </main>

        <div className="fixed bottom-4 left-4 z-50">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full px-4 py-2 shadow-lg flex items-center gap-2 transition-colors">
            <span className={`w-2 h-2 rounded-full ${isApiReady ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
            <span className="text-xs font-medium text-gray-600 dark:text-gray-300">{isApiReady ? 'AI Engine Ready' : 'API Key Required'}</span>
          </div>
        </div>

        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          onSave={handleSaveSettings}
          initialGeminiKey={geminiKey}
          initialGcpProjectId={gcpProjectId}
        />
      </div>
    );
  }

  // Results & Loading Layout
  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen text-slate-800 dark:text-slate-100 flex items-center justify-center py-10 transition-colors duration-300">
      <div className="fixed top-4 right-4 z-50">
        <button onClick={toggleDarkMode} className="p-2 rounded-full bg-white dark:bg-card-dark shadow-lg border border-border-light dark:border-border-dark text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <span className="material-icons-outlined">{isDarkMode ? 'light_mode' : 'brightness_6'}</span>
        </button>
      </div>

      <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in-up">
        <div className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-xl dark:shadow-2xl dark:shadow-indigo-900/20 border border-border-light dark:border-border-dark overflow-hidden transition-colors">
          <div className="relative pt-12 pb-8 px-6 text-center border-b border-border-light dark:border-border-dark bg-slate-50/50 dark:bg-slate-800/50">
            <button onClick={() => setIsSettingsOpen(true)} className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors relative">
              {!isApiReady && (
                <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                </span>
              )}
              <span className="material-icons-outlined">settings</span>
            </button>
            <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
              <span className="gradient-text">画像日本語翻訳ツール</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-sm md:text-base mt-2">
              日本語のテキストが含まれる画像をアップロードすると、AIがレイアウトを保ったまま英語に翻訳します。
            </p>
          </div>

          <div className="p-6 md:p-10 space-y-12">

            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 opacity-75 hover:opacity-100 transition-opacity duration-300">
              <div className="border border-border-light dark:border-border-dark rounded-xl p-5 bg-white dark:bg-slate-800/50 shadow-sm transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-xs font-bold">1</span>
                  <h3 className="font-bold text-slate-700 dark:text-slate-200">画像をアップロード</h3>
                </div>
                <ImageUploader onImageSelect={handleImageSelect} previewUrl={originalImageUrl} />
              </div>

              <div className="border border-border-light dark:border-border-dark rounded-xl p-5 bg-white dark:bg-slate-800/50 shadow-sm flex flex-col justify-between transition-colors">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300 text-xs font-bold">2</span>
                    <h3 className="font-bold text-slate-700 dark:text-slate-200">翻訳を実行</h3>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                    画像を選択したら、以下のボタンをクリックしてAI翻訳を開始します。<br />
                    <span className="opacity-75">※大きめの画像の場合、数十秒かかることがあります。</span>
                  </p>
                </div>
                <button
                  onClick={handleTranslate}
                  disabled={!originalImageFile || isLoading}
                  className="w-full py-3 bg-primary hover:bg-primary-hover text-white rounded-lg font-bold shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                >
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
                      <span className="material-icons-outlined text-lg group-hover:rotate-180 transition-transform duration-500">sync</span>
                      再翻訳を実行
                    </>
                  )}
                </button>
              </div>
            </div>

            {isLoading && (
              <div className="flex justify-center animate-fade-in-up">
                <ProgressBar
                  progress={progress}
                  message={progressMessage}
                  isVisible={isLoading}
                />
              </div>
            )}

            {translations && originalImageUrl && !isLoading && (
              <ResultDisplay
                originalImageUrl={originalImageUrl}
                initialTranslations={translations}
                defaultFilename={defaultFilename}
                isGeneratingFilename={isGeneratingFilename}
              />
            )}
          </div>
        </div>
      </main>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSaveSettings}
        initialGeminiKey={geminiKey}
        initialGcpProjectId={gcpProjectId}
      />
    </div>
  );
}