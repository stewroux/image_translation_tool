import React from 'react';

interface ProgressBarProps {
  progress: number;
  message: string;
  isVisible: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress, message, isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="w-full max-w-md mx-auto bg-white dark:bg-slate-800/50 p-6 rounded-xl shadow-lg border border-border-light dark:border-border-dark mt-8 transition-colors">
      <div className="mb-3">
        <div className="flex justify-between items-center">
          <span className="text-sm font-bold text-slate-600 dark:text-slate-300">{message}</span>
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{Math.round(progress)}%</span>
        </div>
      </div>
      <div className="w-full bg-slate-200 dark:bg-slate-700/50 rounded-full h-2 overflow-hidden border border-slate-300 dark:border-slate-600/50">
        <div
          className="bg-primary h-full rounded-full transition-all duration-300 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  );
};