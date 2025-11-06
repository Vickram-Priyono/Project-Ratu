import React, { useState, useCallback, useEffect } from "react";
import type { View, HistoryItem } from "./types";
import { getGameData } from "./services/gameService";
import Scanner from "./components/Scanner";
import ResultDisplay from "./components/ResultDisplay";
import HistoryLog from "./components/HistoryLog";
import { CameraIcon, HistoryIcon } from "./components/icons/StaticIcons";
import { audioService } from "./services/audioService.ts";

const LOCAL_STORAGE_KEY = "detective-game-history";

// Helper to load history from localStorage
const loadHistory = (): HistoryItem[] => {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error("Failed to load history from localStorage", error);
    return [];
  }
};

// Helper to save history to localStorage
const saveHistory = (history: HistoryItem[]) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(history));
  } catch (error) {
    console.error("Failed to save history to localStorage", error);
  }
};

// Home Screen Component
const HomeScreen: React.FC<{
  onScan: () => void;
  onHistory: () => void;
  historyCount: number;
}> = ({ onScan, onHistory, historyCount }) => (
  <div className="w-full h-full bg-gray-900 text-white flex flex-col items-center justify-center p-8 animate-fade-in">
    <div className="text-center mb-12">
      <h1
        className="text-5xl font-bold text-amber-400 mb-2"
        style={{ fontFamily: "'Cormorant Garamond', serif" }}
      >
        Case Closed
      </h1>
      <p className="text-gray-300">Uncover the truth, one clue at a time.</p>
    </div>

    <div className="w-full max-w-sm flex flex-col gap-4">
      <button
        onClick={onScan}
        className="flex items-center justify-center w-full px-6 py-4 bg-amber-500 text-gray-900 font-bold rounded-lg shadow-lg hover:bg-amber-400 transition-all duration-300 transform hover:scale-105"
      >
        <CameraIcon className="w-7 h-7 mr-3" />
        <span>SCAN CLUE</span>
      </button>

      <button
        onClick={onHistory}
        className="flex items-center justify-center w-full px-6 py-3 bg-gray-700/50 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors duration-200"
      >
        <HistoryIcon className="w-6 h-6 mr-3" />
        <span>VIEW EVIDENCE ({historyCount})</span>
      </button>
    </div>
    <footer className="absolute bottom-4 text-center text-gray-600 text-xs">
      <p>Scan the provided QR codes to begin your investigation.</p>
    </footer>
  </div>
);

const App: React.FC = () => {
  const [view, setView] = useState<View>("home");
  const [history, setHistory] = useState<HistoryItem[]>(loadHistory);
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);

  // Persist history whenever it changes
  useEffect(() => {
    saveHistory(history);
  }, [history]);

  const handleScanSuccess = useCallback((decodedText: string) => {
    const itemData = getGameData(decodedText);

    if (itemData) {
      audioService.playScanSuccess();
      const newHistoryItem: HistoryItem = {
        ...itemData,
        scannedAt: new Date().toISOString(),
      };

      setHistory((prevHistory) => {
        // If item already exists, move it to the top. Otherwise, add it.
        const otherItems = prevHistory.filter(
          (h) => h.id !== newHistoryItem.id
        );
        return [newHistoryItem, ...otherItems];
      });

      setSelectedItem(newHistoryItem);
      setView("result");
    } else {
      audioService.playScanFailure();
      // For simplicity, we'll alert and go back home.
      alert(
        `Unrecognized Clue: This QR code is not part of the current investigation.`
      );
      setView("home");
    }
  }, []);

  const handleScanError = useCallback((errorMessage: string) => {
    audioService.playScanFailure();
    alert(`Scanner Error: ${errorMessage}`);
    setView("home");
  }, []);

  const handleSelectItemFromHistory = (item: HistoryItem) => {
    audioService.playUIClick();
    setSelectedItem(item);
    setView("result");
  };

  const handleBackToHistory = () => {
    audioService.playUIClick();
    // When backing out of a result, go to history view
    setView("history");
  };

  const handleBackToHome = () => {
    audioService.playUIClick();
    setView("home");
  };

  const handleStartScan = () => {
    audioService.playUIClick();
    setView("scanning");
  };

  const handleViewHistory = () => {
    audioService.playUIClick();
    setView("history");
  };

  const renderContent = () => {
    switch (view) {
      case "scanning":
        return (
          <Scanner
            onSuccess={handleScanSuccess}
            onError={handleScanError}
            onCancel={handleBackToHome}
          />
        );
      case "result":
        // This case should not be reachable if selectedItem is null, but we add a fallback.
        if (!selectedItem) {
          setView("home");
          return null;
        }
        return (
          <ResultDisplay item={selectedItem} onBack={handleBackToHistory} />
        );
      case "history":
        return (
          <HistoryLog
            history={history}
            onSelectItem={handleSelectItemFromHistory}
            onBack={handleBackToHome}
          />
        );
      case "home":
      default:
        return (
          <HomeScreen
            onScan={handleStartScan}
            onHistory={handleViewHistory}
            historyCount={history.length}
          />
        );
    }
  };

  return (
    <main className="w-screen h-screen overflow-hidden bg-gray-900 font-sans">
      {renderContent()}
    </main>
  );
};

export default App;
