import React, { useState, useEffect } from "react";
import type { HistoryItem } from "../types";
import { ChevronLeftIcon } from "./icons/StaticIcons";

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
        <button
          onClick={onBack}
          className="p-2 rounded-full hover:bg-gray-700 transition-colors"
        >
          <ChevronLeftIcon className="w-6 h-6 text-white" />
        </button>
        <h2 className="text-xl font-bold text-white ml-4">Scan Result</h2>
      </header>

      {/* The entire view is now dedicated to displaying the image */}
      <div className="flex-grow p-4 flex items-center justify-center overflow-hidden">
        {!imageError ? (
          <img
            src={item.imageUrl}
            alt={item.title} // Alt text is kept for accessibility
            className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full max-w-md bg-gray-700/50 rounded-lg flex flex-col items-center justify-center text-center p-4 border border-red-500/30">
            <p className="font-semibold text-red-400">Image Not Found</p>
            <p className="text-xs text-gray-400 mt-2">
              Could not load image from:
            </p>
            <code className="text-xs bg-gray-800 p-1 rounded mt-1 break-all">
              {item.imageUrl}
            </code>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultDisplay;
