import React, { useState } from 'react';
import { UploadIcon } from './icons';

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
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      alert('エラー: 対応していないファイル形式です（PNG, JPG, GIFのみ可）');
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
      className="w-full h-full min-h-[16rem]"
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
          className="w-full h-full min-h-[16rem] cursor-pointer group relative rounded-xl overflow-hidden shadow-lg border-2 border-slate-700 hover:border-indigo-400 transition-all duration-300 flex items-center justify-center bg-slate-900/50"
          onClick={handleClick}
        >
          <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center z-10 backdrop-blur-sm">
            <UploadIcon className="w-10 h-10 text-white mb-2" />
            <p className="text-white font-medium">画像を変更する</p>
          </div>
          <img
            src={previewUrl}
            alt="Selected preview"
            className="w-full h-full max-h-[400px] object-contain group-hover:scale-[1.02] transition-transform duration-500"
          />
        </div>
      ) : (
        <div
          onClick={handleClick}
          className={`w-full h-full min-h-[16rem] border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group ${isDragging
            ? 'border-indigo-400 bg-indigo-500/10 scale-[1.02] shadow-[0_0_20px_rgba(99,102,241,0.2)]'
            : 'border-slate-600 hover:border-indigo-400 hover:bg-slate-800/80 hover:shadow-lg'
            }`}
        >
          <div className={`p-4 rounded-full transition-colors duration-300 ${isDragging ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-800 text-slate-400 group-hover:bg-indigo-500/20 group-hover:text-indigo-300'}`}>
            <UploadIcon />
          </div>
          <h3 className="mt-4 text-lg font-medium text-slate-200">
            {isDragging ? 'ドロップしてアップロード' : '画像ファイルを選択'}
          </h3>
          <p className="mt-2 text-sm text-slate-400 text-center max-w-[80%]">
            <span className="font-semibold text-indigo-400 group-hover:text-indigo-300 transition-colors">クリックして参照</span>
            またはドラッグ＆ドロップ
          </p>
          <div className="mt-4 flex gap-2 text-xs font-medium text-slate-500">
            <span className="px-2 py-1 bg-slate-800 rounded">PNG</span>
            <span className="px-2 py-1 bg-slate-800 rounded">JPG</span>
            <span className="px-2 py-1 bg-slate-800 rounded">GIF</span>
            <span className="px-2 py-1 bg-slate-800 rounded">最大 10MB</span>
          </div>
        </div>
      )}
    </div>
  );
};