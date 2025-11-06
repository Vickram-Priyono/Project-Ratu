
import React, { useState, useEffect } from 'react';
import type { HistoryItem } from '../types';
import { ChevronLeftIcon } from './icons/StaticIcons';

interface ResultDisplayProps {
  item: HistoryItem;
  onBack: () => void;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ item, onBack }) => {
  const [imageError, setImageError] = useState(false);

  // Reset image error state when the item changes
  useEffect(() => {
    setImageError(false);
  }, [item.imageUrl]);

  return (
    <div className="w-full h-full bg-gray-800 flex flex-col animate-fade-in">
      <header className="p-4 bg-gray-900/80 backdrop-blur-sm border-b border-gray-700 flex items-center sticky top-0 z-10">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-700 transition-colors">
          <ChevronLeftIcon className="w-6 h-6 text-white" />
        </button>
        <div className="flex items-center gap-3 ml-4">
          <item.icon className="w-8 h-8 text-amber-400" />
          <div>
            <h2 className="text-xl font-bold text-white">{item.title}</h2>
            <p className="text-sm text-gray-400">{item.subtitle}</p>
          </div>
        </div>
      </header>

      <div className="flex-grow p-4 sm:p-6 overflow-y-auto">
        <div className="mb-6">
          {!imageError ? (
            <img
              src={item.imageUrl}
              alt={item.title}
              className="w-full h-auto rounded-lg shadow-lg object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full aspect-video bg-gray-700/50 rounded-lg flex flex-col items-center justify-center text-center p-4 border border-red-500/30">
              <p className="font-semibold text-red-400">Image Not Found</p>
              <p className="text-xs text-gray-400 mt-2">
                Could not load image from:
              </p>
              <code className="text-xs bg-gray-800 p-1 rounded mt-1">{item.imageUrl}</code>
              <p className="text-xs text-gray-500 mt-3 max-w-xs">
                Please ensure this file exists in the 'public' folder and has been committed to your Git repository for Vercel to find it.
              </p>
            </div>
          )}
        </div>

        <div
          className="prose prose-invert prose-lg max-w-none text-gray-300 whitespace-pre-wrap"
          style={{ fontFamily: 'serif' }}
          dangerouslySetInnerHTML={{ __html: item.content.replace(/\n/g, '<br /><br />') }}
        />
      </div>
    </div>
  );
};

export default ResultDisplay;
