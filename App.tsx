import React, { useState, useCallback, useMemo } from "react";
import type { HistoryItem, View } from "./types";
import { getGameData } from "./services/gameService";

import CardFlipAnimation from "./components/CardFlipAnimation";
import Scanner from "./components/Scanner";
import HistoryLog from "./components/HistoryLog";
import ResultDisplay from "./components/ResultDisplay";
import { CameraIcon, HistoryIcon } from "./components/icons/StaticIcons";

const App: React.FC = () => {
  const [view, setView] = useState<View>("home");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [currentItem, setCurrentItem] = useState<HistoryItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleStartScan = () => {
    setError(null);
    setView("scanning");
  };

  const handleScanSuccess = useCallback((qrCode: string) => {
    const gameItem = getGameData(qrCode);
    setView("home"); // Return to home to show animation overlay

    if (gameItem) {
      const newHistoryItem: HistoryItem = {
        ...gameItem,
        scannedAt: new Date().toISOString(),
      };

      setHistory((prev) => {
        const filtered = prev.filter((item) => item.id !== newHistoryItem.id);
        return [newHistoryItem, ...filtered];
      });

      setCurrentItem(newHistoryItem);
      setIsAnimating(true);
    } else {
      setError(`QR Code not recognized: ${qrCode}`);
      setTimeout(() => setError(null), 5000);
    }
  }, []);

  const handleScanError = useCallback((errorMessage: string) => {
    setError(errorMessage);
    setView("home");
    setTimeout(() => setError(null), 5000);
  }, []);

  const handleHistorySelect = useCallback((item: HistoryItem) => {
    setCurrentItem(item);
    setView("result");
  }, []);

  const handleAnimationComplete = useCallback(() => {
    setIsAnimating(false);
    setView("result");
  }, []);

  const renderContent = () => {
    if (isAnimating && currentItem) {
      return (
        <CardFlipAnimation
          imageUrl={currentItem.imageUrl}
          onAnimationComplete={handleAnimationComplete}
        />
      );
    }

    switch (view) {
      case "scanning":
        return (
          <Scanner
            onSuccess={handleScanSuccess}
            onError={handleScanError}
            onCancel={() => setView("home")}
          />
        );
      case "history":
        return (
          <HistoryLog
            history={history}
            onSelectItem={handleHistorySelect}
            onBack={() => setView("home")}
          />
        );
      case "result":
        return (
          currentItem && (
            <ResultDisplay
              item={currentItem}
              onBack={() => setView("history")}
            />
          )
        );
      case "home":
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="mb-8">
              <h1
                className="text-4xl md:text-5xl font-bold text-amber-300 tracking-wider"
                style={{ fontFamily: "monospace" }}
              >
                CASE FILE
              </h1>
              <p className="text-gray-400 mt-2">
                Scan QR codes on cards to uncover clues.
              </p>
            </div>

            <div
              onClick={handleStartScan}
              className="group flex flex-col items-center justify-center cursor-pointer"
              role="button"
              tabIndex={0}
              onKeyPress={(e) => {
                if (e.key === "Enter" || e.key === " ") handleStartScan();
              }}
              aria-label="Scan for a new clue"
            >
              <div className="flex items-center justify-center w-48 h-48 bg-gray-800 rounded-full border-4 border-amber-400/50 group-hover:border-amber-400/100 shadow-lg group-hover:shadow-amber-400/20 transition-all duration-300 transform group-hover:scale-105">
                <CameraIcon className="w-20 h-20 text-gray-400 group-hover:text-amber-300 transition-colors duration-300" />
              </div>
              <p className="mt-4 text-lg font-semibold text-gray-300 group-hover:text-amber-300 transition-colors duration-300">
                Scan Clue
              </p>
            </div>
          </div>
        );
    }
  };

  const MemoizedHistoryIcon = useMemo(
    () => <HistoryIcon className="w-7 h-7" />,
    []
  );
  const showFooter = view === "home" && !isAnimating;

  return (
    <main className="w-full h-full bg-gray-900 text-white flex flex-col overflow-hidden relative font-sans">
      <div className="flex-grow overflow-auto">{renderContent()}</div>

      {showFooter && (
        <footer className="w-full p-4 bg-gray-900/80 backdrop-blur-sm border-t border-gray-700 flex justify-center items-center sticky bottom-0 z-10">
          <button
            onClick={() => setView("history")}
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
    </main>
  );
};

export default App;
