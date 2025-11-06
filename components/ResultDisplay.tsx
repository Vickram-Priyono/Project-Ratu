
import React from 'react';
import type { HistoryItem } from '../types';
import { ChevronLeftIcon } from './icons/StaticIcons';

interface ResultDisplayProps {
  item: HistoryItem;
  onBack: () => void;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ item, onBack }) => {

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
        <img
          src={item.imageUrl}
          alt={item.title}
          className="w-full h-auto rounded-lg shadow-lg object-cover mb-6"
        />

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