import React, { useState, useCallback, useMemo, useEffect } from "react";
import type { HistoryItem, View, Character } from "./types";
import { getGameData } from "./services/gameService";

import CardFlipAnimation from "./components/CardFlipAnimation";
import Scanner from "./components/Scanner";
import HistoryLog from "./components/HistoryLog";
import ResultDisplay from "./components/ResultDisplay";
import CharacterGallery from "./components/CharacterGallery";
import CharacterDetail from "./components/CharacterDetail";
import { CameraIcon, HistoryIcon, UsersIcon } from "./components/icons/StaticIcons";

const VIEW_ORDER: View[] = ["home", "history", "result", "gallery", "character_detail"];

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

const ResetIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7H18" />
  </svg>
);

const App: React.FC = () => {
  const [view, setView] = useState<View>("home");
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("detectified_history");
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as { id: string; scannedAt: string }[];
          return parsed
            .map((savedItem) => {
              const gameItem = getGameData(savedItem.id);
              if (gameItem) {
                return {
                  ...gameItem,
                  scannedAt: savedItem.scannedAt,
                };
              }
              return null;
            })
            .filter((item): item is HistoryItem => item !== null);
        } catch (e) {
          console.error("Failed to parse history from localStorage", e);
        }
      }
    }
    return [];
  });
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [currentItem, setCurrentItem] = useState<HistoryItem | null>(null);
  const [resultBackView, setResultBackView] = useState<View>("history");
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationClass, setAnimationClass] = useState("");

  useEffect(() => {
    if (history.length > 0) {
      const historyToSave = history.map((item) => ({
        id: item.id,
        scannedAt: item.scannedAt,
      }));
      localStorage.setItem("detectified_history", JSON.stringify(historyToSave));
    } else {
      localStorage.removeItem("detectified_history");
    }
  }, [history]);

  const handleResetProgress = useCallback(() => {
    triggerHapticFeedback([100, 50, 100]); // Intense haptic feedback for reset
    setHistory([]);
    setCurrentItem(null);
    setSelectedCharacter(null);
    localStorage.removeItem("detectified_history");
    setShowResetConfirm(false);
    setView("home");
  }, []);

  const navigateTo = useCallback(
    (newView: View, animationType: 'slide' | 'none' = 'slide') => {
      let animationName = "";

      if (animationType === 'slide') {
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
      setResultBackView("history");
      navigateTo("result");
    },
    [navigateTo]
  );

  const handleCharacterSelect = useCallback(
    (character: Character) => {
      triggerHapticFeedback();
      setSelectedCharacter(character);
      navigateTo("character_detail");
    },
    [navigateTo]
  );

  const handleAnimationComplete = useCallback(() => {
    setIsAnimating(false);
    setResultBackView("history");
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
                    onBack={() => navigateTo(resultBackView)}
                  />
                )
              );
            case "gallery":
              return (
                <CharacterGallery
                  history={history}
                  onSelectCharacter={handleCharacterSelect}
                  onBack={() => navigateTo("home")}
                />
              );
            case "character_detail":
               return (
                  selectedCharacter && (
                    <CharacterDetail
                      character={selectedCharacter}
                      history={history}
                      onBack={() => navigateTo("gallery")}
                      onSelectItem={(item) => {
                        triggerHapticFeedback();
                        setCurrentItem(item);
                        setResultBackView("character_detail");
                        navigateTo("result");
                      }}
                    />
                  )
               );
            case "home":
            default:
              return (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <div className="mb-8 drop-shadow-xl bg-gray-900/30 backdrop-blur-sm p-6 rounded-2xl border border-gray-700/50">
                    <h1
                      className="text-4xl md:text-5xl font-bold text-amber-300 tracking-wider mb-2"
                      style={{ fontFamily: "monospace", textShadow: "0 2px 10px rgba(0,0,0,0.8)" }}
                    >
                      Justified
                    </h1>
                    <p className="text-gray-200 mt-2 font-medium" style={{ textShadow: "0 1px 4px rgba(0,0,0,0.8)" }}>
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
                    <div className="flex items-center justify-center w-48 h-48 bg-gray-800/80 backdrop-blur-sm rounded-full border-4 border-amber-400/50 group-hover:border-amber-400/100 shadow-lg group-hover:shadow-amber-400/20 transition-all duration-300 transform group-hover:scale-105 animate-pulse-glow">
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
    () => <HistoryIcon className="w-6 h-6" />,
    []
  );

  const MemoizedUsersIcon = useMemo(
    () => <UsersIcon className="w-6 h-6" />,
    []
  );
  
  const showFooter = view === "home" && !isAnimating;
  const showResetButton = view === "home" && !isAnimating;

  return (
    <main className="w-full h-full bg-transparent text-white flex flex-col overflow-hidden relative font-sans">
      {showResetButton && (
        <button
          onClick={() => {
            triggerHapticFeedback();
            setShowResetConfirm(true);
          }}
          className="absolute top-4 left-4 p-2.5 rounded-full bg-gray-800/90 hover:bg-gray-700 text-amber-400 border border-gray-700 shadow-lg backdrop-blur-md z-30 transition-all duration-200 active:scale-95 flex items-center justify-center cursor-pointer"
          aria-label="Reset progress"
        >
          <ResetIcon className="w-5 h-5" />
        </button>
      )}

      <div className="flex-grow overflow-auto">{renderContent()}</div>

      {showFooter && (
        <footer className="w-full p-4 bg-gray-900/80 backdrop-blur-sm border-t border-gray-700 flex justify-center items-center gap-4 sticky bottom-0 z-10">
          <button
            onClick={() => {
              triggerHapticFeedback();
              navigateTo("history");
            }}
            disabled={history.length === 0}
            className="flex-1 flex justify-center items-center gap-2 px-4 py-3 bg-gray-700 text-white font-semibold rounded-lg shadow-md hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {MemoizedHistoryIcon}
            Riwayat
          </button>
          
          <button
            onClick={() => {
              triggerHapticFeedback();
              navigateTo("gallery");
            }}
            className="flex-1 flex justify-center items-center gap-2 px-4 py-3 bg-gray-700 text-white font-semibold rounded-lg shadow-md hover:bg-gray-600 transition-colors duration-200"
          >
            {MemoizedUsersIcon}
            Karakter
          </button>
        </footer>
      )}

      {error && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-red-800/90 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
          <p>{error}</p>
        </div>
      )}

      {showResetConfirm && (
        <div className="absolute inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-fade-in animate-duration-200">
          <div className="bg-gray-900/95 border border-gray-700 p-6 rounded-2xl max-w-xs w-full shadow-2xl text-center flex flex-col items-center">
            <div className="w-14 h-14 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Reset Progress?</h3>
            <p className="text-gray-300 text-sm mb-6 leading-relaxed">
              Semua alibi dan riwayat bukti yang telah Anda kumpulkan akan dihapus kembali ke awal.
            </p>
            <div className="flex gap-3 w-full">
              <button
                onClick={() => {
                  triggerHapticFeedback();
                  setShowResetConfirm(false);
                }}
                className="flex-1 py-2.5 px-4 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold rounded-lg transition-colors border border-gray-700 text-sm cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleResetProgress}
                className="flex-1 py-2.5 px-4 bg-red-700 hover:bg-red-600 text-white font-semibold rounded-lg shadow-md transition-colors text-sm cursor-pointer"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default App;