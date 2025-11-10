
import React from 'react';

interface LoaderProps {
  loadingText: string;
}

export const Loader: React.FC<LoaderProps> = ({ loadingText }) => {
  return (
    <div className="fixed inset-0 bg-slate-900 bg-opacity-80 backdrop-blur-sm flex flex-col items-center justify-center z-50">
      <div className="w-16 h-16 border-4 border-slate-500 border-t-indigo-500 rounded-full animate-spin"></div>
      <p className="mt-4 text-white text-lg font-semibold">{loadingText}</p>
    </div>
  );
};
