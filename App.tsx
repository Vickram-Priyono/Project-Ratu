import React, { useState, useCallback, useMemo } from "react";
import type { HistoryItem, View } from "./types";
import { getGameData } from "./services/gameService";

import CardFlipAnimation from "./components/CardFlipAnimation";
import Scanner from "./components/Scanner";
import HistoryLog from "./components/HistoryLog";
import ResultDisplay from "./components/ResultDisplay";
import { CameraIcon, HistoryIcon } from "./components/icons/StaticIcons";

const VIEW_ORDER: View[] = ["home", "history", "result"];

// FIX: Allow `intensity` to be a number or an array of numbers (VibratePattern) to support custom vibration patterns.
const triggerHapticFeedback = (intensity: number | number[] = 50) => {
  if (navigator.vibrate) {
    try {
      navigator.vibrate(intensity);
    } catch (e) {
      console.warn("Haptic feedback failed.", e);
    }
  }
};

const App: React.FC = () => {
  const [view, setView] = useState<View>("home");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [currentItem, setCurrentItem] = useState<HistoryItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationClass, setAnimationClass] = useState("");

  const navigateTo = useCallback(
    (newView: View, animationType: "slide" | "none" = "slide") => {
      let animationName = "";

      if (animationType === "slide") {
        const currentIndex = VIEW_ORDER.indexOf(view);
        const newIndex = VIEW_ORDER.indexOf(newView);

        if (newIndex > currentIndex) {
          animationName = "animate-slide-in-right";
        } else if (newIndex < currentIndex) {
          animationName = "animate-slide-in-left";
        } else {
          animationName = "animate-fade-in";
        }
      }
      // if type is 'none', animationName is empty string, which is correct.

      setAnimationClass(animationName);
      setView(newView);

      if (animationName) {
        setTimeout(() => {
          setAnimationClass("");
        }, 300);
      }
    },
    [view]
  );

  const handleStartScan = () => {
    triggerHapticFeedback();
    setError(null);
    setView("scanning"); // Scanning is an overlay, no slide transition
  };

  const handleScanSuccess = useCallback((qrCode: string) => {
    const gameItem = getGameData(qrCode);
    setView("home"); // Return to home to show animation overlay

    if (gameItem) {
      const newHistoryItem: HistoryItem = {
        ...gameItem,
        scannedAt: new Date().toISOString(),
      };

      triggerHapticFeedback(100); // A stronger vibration for success

      setHistory((prev) => {
        const filtered = prev.filter((item) => item.id !== newHistoryItem.id);
        return [newHistoryItem, ...filtered];
      });

      setCurrentItem(newHistoryItem);
      setIsAnimating(true);
    } else {
      triggerHapticFeedback([100, 50, 100]); // Vibrate pattern for error
      setError(`QR Code not recognized: ${qrCode}`);
      setTimeout(() => setError(null), 5000);
    }
  }, []);

  const handleScanError = useCallback((errorMessage: string) => {
    triggerHapticFeedback([100, 50, 100]); // Vibrate pattern for error
    setError(errorMessage);
    setView("home");
    setTimeout(() => setError(null), 5000);
  }, []);

  const handleHistorySelect = useCallback(
    (item: HistoryItem) => {
      triggerHapticFeedback();
      setCurrentItem(item);
      navigateTo("result");
    },
    [navigateTo]
  );

  const handleAnimationComplete = useCallback(() => {
    setIsAnimating(false);
    navigateTo("result", "none");
  }, [navigateTo]);

  const renderContent = () => {
    // Overlays like scanning and card flip animation don't participate in slide transitions
    if (isAnimating && currentItem) {
      return (
        <CardFlipAnimation
          key={currentItem.scannedAt}
          imageUrl={currentItem.imageUrl}
          onAnimationComplete={handleAnimationComplete}
        />
      );
    }
    if (view === "scanning") {
      return (
        <Scanner
          onSuccess={handleScanSuccess}
          onError={handleScanError}
          onCancel={() => setView("home")}
        />
      );
    }

    // Content container with animation class
    return (
      <div className={`w-full h-full ${animationClass}`}>
        {(() => {
          switch (view) {
            case "history":
              return (
                <HistoryLog
                  history={history}
                  onSelectItem={handleHistorySelect}
                  onBack={() => navigateTo("home")}
                />
              );
            case "result":
              return (
                currentItem && (
                  <ResultDisplay
                    item={currentItem}
                    onBack={() => navigateTo("history")}
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
                      Detectified
                    </h1>
                    <p className="text-gray-400 mt-2">
                      Pindai QR code pada kartu untuk mendapatkan alibi atau
                      bukti.
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
                    <div className="flex items-center justify-center w-48 h-48 bg-gray-800 rounded-full border-4 border-amber-400/50 group-hover:border-amber-400/100 shadow-lg group-hover:shadow-amber-400/20 transition-all duration-300 transform group-hover:scale-105 animate-pulse-glow">
                      <CameraIcon className="w-20 h-20 text-gray-400 group-hover:text-amber-300 transition-colors duration-300" />
                    </div>
                    <p className="mt-4 text-lg font-semibold text-gray-300 group-hover:text-amber-300 transition-colors duration-300">
                      Klik untuk Memindai
                    </p>
                  </div>
                </div>
              );
          }
        })()}
      </div>
    );
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
            onClick={() => {
              triggerHapticFeedback();
              navigateTo("history");
            }}
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
