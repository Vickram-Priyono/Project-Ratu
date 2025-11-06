
import React, { useState, useCallback, useMemo } from 'react';
import type { HistoryItem, View } from './types';
import { getGameData } from './services/gameService';

import Scanner from './components/Scanner';
import HistoryLog from './components/HistoryLog';
import ResultDisplay from './components/ResultDisplay';
import { CameraIcon, HistoryIcon } from './components/icons/StaticIcons';

const App: React.FC = () => {
  const [view, setView] = useState<View>('home');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [currentItem, setCurrentItem] = useState<HistoryItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleScanSuccess = useCallback((decodedText: string) => {
    setView('home');
    setError(null);

    const gameDataItem = getGameData(decodedText);

    if (!gameDataItem) {
      setError(`Unknown clue: ${decodedText}. Please scan a valid game card.`);
      setTimeout(() => setError(null), 5000);
      return;
    }

    const newHistoryItem: HistoryItem = {
      ...gameDataItem,
      scannedAt: new Date().toISOString(),
    };
    
    setHistory(prevHistory => {
      // Avoid adding duplicate entries
      if (prevHistory.some(item => item.id === newHistoryItem.id)) {
        // If item exists, move it to the top
        const existingItem = prevHistory.find(item => item.id === newHistoryItem.id)!;
        const filteredHistory = prevHistory.filter(item => item.id !== newHistoryItem.id);
        setCurrentItem(existingItem);
        setView('result');
        return [existingItem, ...filteredHistory];
      }
      setCurrentItem(newHistoryItem);
      setView('result');
      return [newHistoryItem, ...prevHistory];
    });
  }, []);

  const handleScanError = useCallback((errorMessage: string) => {
    console.error(`QR Scanner Error: ${errorMessage}`);
    setError(errorMessage);
    setView('home');
    setTimeout(() => setError(null), 5000);
  }, []);
  
  const viewItemFromHistory = useCallback((item: HistoryItem) => {
    setCurrentItem(item);
    setView('result');
  }, []);

  const renderContent = () => {
    switch (view) {
      case 'scanning':
        return <Scanner onSuccess={handleScanSuccess} onError={handleScanError} onCancel={() => setView('home')} />;
      case 'history':
        return <HistoryLog history={history} onSelectItem={viewItemFromHistory} onBack={() => setView('home')} />;
      case 'result':
        return currentItem && <ResultDisplay item={currentItem} onBack={() => setView('home')} />;
      case 'home':
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="mb-8">
              <h1 className="text-4xl md:text-5xl font-bold text-amber-300 tracking-wider" style={{fontFamily: 'monospace'}}>CASE FILE</h1>
              <p className="text-gray-400 mt-2">Scan QR codes on cards to uncover clues.</p>
            </div>
            
            <div
              onClick={() => setView('scanning')}
              className="group flex flex-col items-center justify-center cursor-pointer"
              role="button"
              tabIndex={0}
              onKeyPress={(e) => { if (e.key === 'Enter' || e.key === ' ') setView('scanning'); }}
              aria-label="Scan for a new clue"
            >
              <div
                className="flex items-center justify-center w-48 h-48 bg-gray-800 rounded-full border-4 border-amber-400/50 group-hover:border-amber-400/100 shadow-lg group-hover:shadow-amber-400/20 transition-all duration-300 transform group-hover:scale-105"
              >
                <CameraIcon className="w-20 h-20 text-gray-400 group-hover:text-amber-300 transition-colors duration-300" />
              </div>
              <p className="mt-4 text-lg font-semibold text-gray-300 group-hover:text-amber-300 transition-colors duration-300">Scan Clue</p>
            </div>
          </div>
        );
    }
  };

  const MemoizedHistoryIcon = useMemo(() => <HistoryIcon className="w-7 h-7" />, []);

  return (
    <div className="h-screen w-screen bg-gray-900 font-sans flex flex-col">
      <main className="flex-grow overflow-y-auto relative">
        {renderContent()}
      </main>

      {view === 'home' && (
        <footer className="w-full p-4 bg-gray-900/80 backdrop-blur-sm border-t border-gray-700 flex justify-center items-center sticky bottom-0">
          <button
            onClick={() => setView('history')}
            disabled={history.length === 0}
            className="flex items-center gap-2 px-4 py-3 bg-gray-700 text-white font-semibold rounded-lg shadow-md hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {MemoizedHistoryIcon}
            View History ({history.length})
          </button>
        </footer>
      )}

      {error && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-red-800/90 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

export default App;