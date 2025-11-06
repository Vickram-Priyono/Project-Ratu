import React, { useState, useCallback, Suspense, lazy, useRef } from "react";
import type { HistoryItem, View } from "./types";
import { getGameData } from "./services/gameService";

import CardFlipAnimation from "./components/CardFlipAnimation";
import { CameraIcon, HistoryIcon } from "./components/icons/StaticIcons";

// Lazy load components for code splitting and better initial performance
const Scanner = lazy(() => import("./components/Scanner"));
const HistoryLog = lazy(() => import("./components/HistoryLog"));
const ResultDisplay = lazy(() => import("./components/ResultDisplay"));

// A Base64 encoded WAV file for a subtle card flip sound.
const CARD_FLIP_SOUND =
  "data:audio/wav;base64,UklGRigBAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABgAAABkYXRhZAEAAADg/38A7//+APr//wD8//4A/f/+APz//gD3//8A4f/9AMv//QDQ//sA0v/zAO//4AD//+gA6//uAPf/9gDh//sA6f/2APX//AD6//8A/f//AP3//gD7//8A8f/2AOP/7ADe//IA5v/oAOv/+gD///wABgAAAPz//gD///sA//+5AP//uwD//7oA//+8AP//wQD//8oA///OAP//2AD//+QA//+RAP//igD//5YA//+iAP//pwD//6sA//+pAP//pQD//6YA//+aAP//lgD//5EA//+CAP//dQD//1sA//9MAP//PAD//zQA//85AP//QgD//1EA//9bAP//YwD//2EA//9bAP//VQD//08A//9MAP//QQD//zsA//82AP//NwD//zwA//8/AP//QwD//0sA//9QAP//VQD//1kA//9dAP//YgD//2MA//9jAP//YQD//1wA//9WAP//UAD//0wA//9IAP//RAD//z8A//89AP//PQD//z0A//8+AP//QAD//0MA//9GAP//SgD//04A//9QAP//VAD//1gA//9bAP//XgD//18A//9eAP//WwD//1gA//9WAP//UQD//00A//9JAP//RAD//0AA//8+AP//OQD//zkA//85AP//OgD//zsA//8+AP//QAD//0MA//9GAP//SAD//0sA//9OAP//UAD//1MA//9WAP//VwD//1YA//9VAP//UwD//1EA//9OAP//SwD//0gA//9EAP//QAD//z4A//87AP//OgD//zcA//82AP//NAD//zMA//8zAP//NAD//zgA//86AP//OQD//z0A//8/AP//QAD//0IA//9EAP//RAD//0UA//9EAP//QwD//0EA//8/AP//PQD//zsA//85AP//NAD//zIA//8wAP//LwD//y4A//8uAP//LwD//zEA//8yAP//NAD//zcA//85AP//OQD//zwA//89AP//PQD//zwA//86AP//NwD//zQA//8xAP//LwD//y0A//8qAP//KAD//ycA//8nAP//KAD//yoA//8sAP//LgD//y4=";

const App: React.FC = () => {
  const [view, setView] = useState<View>("home");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [currentItem, setCurrentItem] = useState<HistoryItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleStartScan = () => {
    // Prime the audio on the first user interaction to satisfy browser autoplay policies
    if (!audioRef.current) {
      audioRef.current = new Audio(CARD_FLIP_SOUND);
      // This "play and pause" trick is necessary for some mobile browsers (especially iOS)
      // to unlock the audio context, allowing it to be played later programmatically.
      audioRef.current.play().catch(() => {});
      audioRef.current.pause();
    }
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

      // Avoid adding duplicates to history, but bring existing to the front
      setHistory((prev) => {
        const filtered = prev.filter((item) => item.id !== newHistoryItem.id);
        return [newHistoryItem, ...filtered];
      });

      setCurrentItem(newHistoryItem);
      setIsAnimating(true); // Trigger animation
    } else {
      setError(`QR Code not recognized: ${qrCode}`);
    }
  }, []);

  const handleScanError = useCallback((errorMessage: string) => {
    setError(errorMessage);
    setView("home");
  }, []);

  const handleScanCancel = useCallback(() => {
    setView("home");
  }, []);

  const handleHistorySelect = useCallback((item: HistoryItem) => {
    setCurrentItem(item);
    setView("result");
  }, []);

  const handleBack = useCallback(() => {
    if (view === "result") {
      setView("history");
    } else if (view === "history") {
      setView("home");
    }
  }, [view]);

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
          audioRef={audioRef}
        />
      );
    }

    switch (view) {
      case "scanning":
        return (
          <Suspense
            fallback={
              <div className="text-white text-center p-8">
                Loading Scanner...
              </div>
            }
          >
            <Scanner
              onSuccess={handleScanSuccess}
              onError={handleScanError}
              onCancel={handleScanCancel}
            />
          </Suspense>
        );
      case "history":
        return (
          <Suspense
            fallback={
              <div className="text-white text-center p-8">
                Loading History...
              </div>
            }
          >
            <HistoryLog
              history={history}
              onSelectItem={handleHistorySelect}
              onBack={() => setView("home")}
            />
          </Suspense>
        );
      case "result":
        return currentItem ? (
          <Suspense
            fallback={
              <div className="text-white text-center p-8">
                Loading Result...
              </div>
            }
          >
            <ResultDisplay item={currentItem} onBack={handleBack} />
          </Suspense>
        ) : (
          <div className="text-center p-8">
            <p className="text-gray-400">No item selected.</p>
            <button
              onClick={() => setView("home")}
              className="mt-4 text-amber-400"
            >
              Go Home
            </button>
          </div>
        );
      case "home":
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <h1 className="text-4xl font-bold text-amber-300 drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">
              Case Closed
            </h1>
            <p className="text-lg text-gray-300 mt-2">
              Scan QR codes to uncover clues.
            </p>
            {error && (
              <div className="mt-4 p-3 bg-red-900/50 border border-red-700 rounded-md text-red-300 w-full max-w-sm">
                <p className="font-bold">Error</p>
                <p className="text-sm mt-1">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="mt-2 text-xs underline hover:text-white"
                >
                  Dismiss
                </button>
              </div>
            )}
          </div>
        );
    }
  };

  const showFooter = view === "home" && !isAnimating;

  return (
    <main className="w-full h-full bg-gray-900 text-white flex flex-col overflow-hidden relative font-sans">
      <div className="flex-grow overflow-auto">{renderContent()}</div>

      {showFooter && (
        <footer className="w-full p-4 bg-gray-900/80 backdrop-blur-sm border-t border-gray-700 flex justify-around items-center sticky bottom-0 z-10">
          <button
            onClick={() => setView("history")}
            disabled={history.length === 0}
            className="flex flex-col items-center text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:hover:text-gray-400"
          >
            <HistoryIcon className="w-7 h-7" />
            <span className="text-xs mt-1">History</span>
          </button>
          <button
            onClick={handleStartScan}
            className="p-4 rounded-full bg-amber-500 text-gray-900 -mt-12 shadow-lg shadow-amber-500/30 border-4 border-gray-900 hover:bg-amber-400 transition-colors"
            aria-label="Scan new clue"
          >
            <CameraIcon className="w-8 h-8" />
          </button>
          {/* Invisible placeholder to keep the center scan button perfectly centered */}
          <div
            className="flex flex-col items-center invisible"
            aria-hidden="true"
          >
            <div className="w-7 h-7" />
            <span className="text-xs mt-1">&nbsp;</span>
          </div>
        </footer>
      )}
    </main>
  );
};

export default App;
