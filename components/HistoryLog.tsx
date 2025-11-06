
import React from 'react';
import type { HistoryItem } from '../types';
import { ChevronLeftIcon } from './icons/StaticIcons';
import { format } from 'date-fns';

interface HistoryLogProps {
  history: HistoryItem[];
  onSelectItem: (item: HistoryItem) => void;
  onBack: () => void;
}

const HistoryLog: React.FC<HistoryLogProps> = ({ history, onSelectItem, onBack }) => {
  return (
    <div className="w-full h-full bg-gray-800 flex flex-col animate-fade-in">
      <header className="p-4 bg-gray-900/80 backdrop-blur-sm border-b border-gray-700 flex items-center sticky top-0 z-10">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-700 transition-colors">
          <ChevronLeftIcon className="w-6 h-6 text-white" />
        </button>
        <h2 className="text-xl font-bold text-white ml-4">Scan History</h2>
      </header>
      
      <div className="flex-grow overflow-y-auto">
        {history.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">No clues scanned yet.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-700">
            {history.map((item) => (
              <li
                key={item.id}
                onClick={() => onSelectItem(item)}
                className="p-4 flex items-center gap-4 hover:bg-gray-700/50 cursor-pointer transition-colors duration-200"
              >
                <div className="p-2 bg-gray-900 rounded-md">
                   <item.icon className="w-8 h-8 text-amber-400" />
                </div>
                <div className="flex-grow">
                  <p className="font-semibold text-white">{item.title}</p>
                  <p className="text-sm text-gray-400">{item.type}</p>
                </div>
                <p className="text-sm text-gray-500">
                  {format(new Date(item.scannedAt), 'HH:mm')}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default HistoryLog;