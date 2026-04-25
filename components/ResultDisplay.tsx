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
    <div className="w-full h-full bg-transparent flex flex-col animate-fade-in">
      <header className="p-4 bg-gray-900/80 backdrop-blur-sm border-b border-gray-700 flex items-center sticky top-0 z-10">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-700 transition-colors">
          <ChevronLeftIcon className="w-6 h-6 text-white" />
        </button>
        <h2 className="text-xl font-bold text-white ml-4">Scan Result</h2>
      </header>

      {/* // FIX: Display all item details, not just the image, and make content scrollable. */}
      <div className="flex-grow overflow-y-auto p-4">
        <div className="max-w-2xl mx-auto">
          <div className="mb-4 bg-gray-900/60 backdrop-blur-sm rounded-lg overflow-hidden shadow-lg">
            {!imageError ? (
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-auto object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full aspect-video bg-gray-700/50 rounded-lg flex flex-col items-center justify-center text-center p-4 border border-red-500/30">
                <p className="font-semibold text-red-400">Image Not Found</p>
                <p className="text-xs text-gray-400 mt-2">
                  Could not load image from:
                </p>
                <code className="text-xs bg-gray-800 p-1 rounded mt-1 break-all">{item.imageUrl}</code>
              </div>
            )}
          </div>

          <div className="bg-gray-900/50 p-4 sm:p-6 rounded-lg">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-gray-700 rounded-md mt-1 flex-shrink-0">
                <item.icon className="w-8 h-8 text-amber-400" />
              </div>
              <div className="flex-grow">
                <h1 className="text-2xl font-bold text-white">{item.title}</h1>
                <p className="text-md text-gray-400">{item.subtitle}</p>
              </div>
            </div>
            <hr className="border-gray-600 my-4" />
            <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{item.content}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ResultDisplay);
