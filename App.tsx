import React from 'react';
import { useState } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { ResultDisplay } from './components/ResultDisplay';
import { ProgressBar } from './components/ProgressBar';
import { translateImageText, generateImageSummary } from './services/geminiService';
import { TranslationBlock } from './types';
import { TranslateIcon } from './components/icons';

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

  const handleImageSelect = async (file: File) => {
    setOriginalImageFile(file);
    setOriginalImageUrl(URL.createObjectURL(file));
    setTranslations(null);
    setError(null);

    // Generate filename in background
    setIsGeneratingFilename(true);
    try {
      const base64Image = await fileToBase64(file);
      const summary = await generateImageSummary(base64Image, file.type);
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

      const apiTranslations = await translateImageText(base64Image, originalImageFile.type);

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
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <main className="w-full max-w-4xl mx-auto bg-slate-800/50 rounded-2xl shadow-2xl backdrop-blur-sm border border-slate-700">
        <div className="p-8 md:p-12">
          <header className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
              画像日本語翻訳ツール
            </h1>
            <p className="mt-4 text-lg text-slate-400">
              日本語のテキストが含まれる画像をアップロードすると、AIが翻訳します。
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="flex flex-col items-center w-full">
              <h2 className="text-2xl font-bold text-slate-200 mb-4">1. 画像をアップロード</h2>
              <ImageUploader onImageSelect={handleImageSelect} previewUrl={originalImageUrl} />
            </div>

            <div className="flex flex-col items-center justify-center w-full mt-8 md:mt-0">
              <h2 className="text-2xl font-bold text-slate-200 mb-4">2. 翻訳</h2>
              <button
                onClick={handleTranslate}
                disabled={!originalImageFile || isLoading}
                className="w-full max-w-xs px-6 py-4 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-slate-600 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-slate-900 transition-all transform hover:scale-105 disabled:scale-100 flex items-center justify-center gap-3"
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
                    <img
                      src="./components/ei-translation.svg"
                      alt="Translation"
                      className="w-6 h-6"
                    />
                    画像を翻訳
                  </>
                )}
              </button>
              {error && <p className="mt-4 text-red-400 text-center">{error}</p>}
            </div>
          </div>

          {/* 進捗バー */}
          {isLoading && (
            <div className="mt-8 flex justify-center">
              <ProgressBar
                progress={progress}
                message={progressMessage}
                isVisible={isLoading}
              />
            </div>
          )}

          {translations && !isLoading && (
            <div className="mt-12 pt-8 border-t border-slate-700">
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
    </div>
  );
}