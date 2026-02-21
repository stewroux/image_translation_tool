import React, { useState } from 'react';

interface ImageUploaderProps {
  onImageSelect: (file: File) => void;
  previewUrl: string | null;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelect, previewUrl }) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    validateAndSelectFile(file);
  };

  const validateAndSelectFile = (file?: File) => {
    if (!file) return;

    // Validate size (10MB)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      alert('エラー: ファイルサイズが大きすぎます（最大10MB）');
      return;
    }

    // Validate type (PNG, JPG, GIF)
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('エラー: 対応していないファイル形式です（PNG, JPG, GIF, WebPのみ可）');
      return;
    }

    onImageSelect(file);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);

    const file = event.dataTransfer.files?.[0];
    validateAndSelectFile(file);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  return (
    <div
      className="w-full h-full min-h-[16rem] flex flex-col"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
      />
      {previewUrl ? (
        <div
          className="aspect-video bg-slate-100 dark:bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center relative group cursor-pointer border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-primary dark:hover:border-primary transition-colors h-full w-full"
          onClick={handleClick}
        >
          <img
            src={previewUrl}
            alt="Selected preview"
            className="w-full h-full object-cover opacity-80 group-hover:opacity-60 transition-opacity"
          />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 px-3 py-1 rounded text-sm shadow-sm group-hover:scale-105 transition-transform">変更する</span>
          </div>
        </div>
      ) : (
        <div
          onClick={handleClick}
          className={`flex-grow flex flex-col justify-center items-center border-2 border-dashed rounded-lg p-8 transition-colors cursor-pointer group ${isDragging
              ? 'border-primary bg-primary/10'
              : 'border-indigo-200 dark:border-indigo-900/50 hover:border-indigo-400 dark:hover:border-indigo-700 bg-white dark:bg-[#0f172a]'
            }`}
        >
          <div className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center mb-4 text-indigo-500 dark:text-indigo-400 group-hover:scale-110 transition-transform">
            <span className="material-icons-outlined text-3xl">cloud_upload</span>
          </div>
          <p className="font-bold text-gray-700 dark:text-gray-200 mb-2">画像ファイルを選択</p>
          <p className="text-sm text-indigo-600 dark:text-indigo-400 mb-4">クリックして参照<span className="text-gray-500 dark:text-gray-500"> またはドラッグ＆ドロップ</span></p>
          <div className="flex gap-2 flex-wrap justify-center">
            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs rounded">PNG</span>
            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs rounded">JPG</span>
            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs rounded">GIF</span>
            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs rounded">最大 10MB</span>
          </div>
        </div>
      )}
    </div>
  );
};