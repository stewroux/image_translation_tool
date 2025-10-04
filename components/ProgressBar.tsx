import React from 'react';

interface ProgressBarProps {
  progress: number; // 0-100の値
  message: string;
  isVisible: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress, message, isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="w-full max-w-md mx-auto bg-slate-700 p-4 rounded-lg shadow-lg">
      <div className="mb-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-slate-200">{message}</span>
          <span className="text-sm text-slate-400">{Math.round(progress)}%</span>
        </div>
      </div>
      <div className="w-full bg-slate-600 rounded-full h-2">
        <div 
          className="bg-gradient-to-r from-indigo-500 to-cyan-500 h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  );
};