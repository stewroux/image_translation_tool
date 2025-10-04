import React from 'react';
import { UploadIcon } from './icons';

interface ImageUploaderProps {
  onImageSelect: (file: File) => void;
  previewUrl: string | null;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelect, previewUrl }) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageSelect(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
        onImageSelect(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
  };


  return (
    <div 
        className="w-full"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
      />
      {previewUrl ? (
        <div className="w-full cursor-pointer group" onClick={handleClick}>
          <img src={previewUrl} alt="Selected preview" className="w-full h-auto max-h-[400px] object-contain rounded-lg shadow-lg border-2 border-slate-600 group-hover:border-indigo-500 transition-colors" />
        </div>
      ) : (
        <div
          onClick={handleClick}
          className="w-full h-64 border-2 border-dashed border-slate-600 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 hover:bg-slate-800 transition-colors"
        >
          <UploadIcon />
          <p className="mt-2 text-sm text-slate-400">
            <span className="font-semibold text-indigo-400">クリックしてアップロード</span>またはドラッグ＆ドロップ
          </p>
          <p className="text-xs text-slate-500">PNG, JPG, GIF (最大10MB)</p>
        </div>
      )}
    </div>
  );
};