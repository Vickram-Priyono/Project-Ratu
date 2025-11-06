import React, {
  useState,
  useCallback,
  useMemo,
  Suspense,
  lazy,
  useRef,
} from "react";
import type { HistoryItem, View } from "./types";
import { getGameData } from "./services/gameService";

import CardFlipAnimation from "./components/CardFlipAnimation";
import { CameraIcon, HistoryIcon } from "./components/icons/StaticIcons";

// Lazy load components for code splitting and better initial performance
const Scanner = lazy(() => import("./components/Scanner"));
const HistoryLog = lazy(() => import("./components/HistoryLog"));
const ResultDisplay = lazy(() => import("./components/ResultDisplay"));

// A Base64 encoded WAV file for a subtle card flip sound.
// Moved here to be initialized on first user interaction.
const CARD_FLIP_SOUND =
  "data:audio/wav;base64,UklGRigBAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABgAAABkYXRhZAEAAADg/38A7//+APr//wD8//4A/f/+APz//gD3//8A4f/9AMv//QDQ//sA0v/zAO/ /4AD//+gA6//uAPf/9gDh//sA6f/2APX//AD6//8A/f//AP3//gD7//8A8f/2AOP/7ADe//IA5v/oAOv/+gD///wABgAAAPz//gD///sA//+5AP//uwD//7oA//+8AP//wQD//8oA// /OAP//2AD//+QA//+RAP//igD//5YA//+iAP//pwD//6sA//+pAP//pQD//6YA//+aAP//lgD//5EA//+CAP//dQD//1sA//9MAP//PAD//zQA//85AP//QgD//1EA//9bAP//YwD//2EA //9bAP//VQD//08A//9MAP//QQD//zsA//82AP//NwD//zwA//8/AP//QwD//0sA//9QAP//VQD//1kA//9dAP//YgD//2MA//9jAP//YQD//1wA//9WAP//UAD//0wA//9IAP//RAD/ /z8A//89AP//PQD//z0A//8+AP//QAD//0MA//9GAP//SgD//04A//9QAP//VAD//1gA//9bAP//XgD//18A//9eAP//WwD//1gA//9WAP//UQD//00A//9JAP//RAD//0AA//8+AP//OQD/ /zkA//85AP//OgD//zsA//8+AP//QAD//0MA//9GAP//SAD//0sA//9OAP//UAD//1MA//9WAP//VwD//1YA//9VAP//UwD//1EA//9OAP//SwD//0gA//9EAP//QAD//z4A//87AP//OgD/ /zcA//82AP//NAD//zMA//8zAP//NAD//zgA//86AP//OQD//z0A//8/AP//QAD//0IA//9EAP//RAD//0UA//9EAP//QwD//0EA//8/AP//PQD//zsA//85AP//NAD//zIA//8wAP//LwD/ /y4A//8uAP//LwD//zEA//8yAP//NAD//zcA//85AP//OQD//zwA//89AP//PQD//zwA//86AP//NwD//zQA//8xAP//LwD//y0A//8qAP//KAD//ycA//8nAP//KAD//yoA//8sAP//LgD/ /y4//8uAP//LAD//yoA//8oAP//JgD//yQA//8hAP//HgD//xsA//8ZAP//GAD//xcA//8WAP//FgD//xYA//8XAP//GAD//xgA//8ZAP//GwD//x0A//8fAP//IgD//yUA//8nAP//KwD//y4A/ /y8A//8vAP//LwD//y4A//8sAP//KQD//yYA//8hAP//HQD//xoA//8XAP//EwD//xIA//8QAP//DwD//w0A//8LAP//CgD//wkA//8IAP//CAD//wgA//8JAP//CgD//wsA//8NAP//DgD/ /w8A//8QAP//EQD//xMA//8VAP//FwD//xk=";

const App: React.FC = () => {
  const [view, setView] = useState<View>("home");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [currentItem, setCurrentItem] = useState<HistoryItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleScanSuccess = useCallback((decodedText: string) => {
    setView("home"); // Go back to home to exit scanner UI immediately
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

    setHistory((prevHistory) => {
      if (prevHistory.some((item) => item.id === newHistoryItem.id)) {
        const existingItem = prevHistory.find(
          (item) => item.id === newHistoryItem.id
        )!;
        const filteredHistory = prevHistory.filter(
          (item) => item.id !== newHistoryItem.id
        );
        setCurrentItem(existingItem);
        setIsFlipping(true);
        return [existingItem, ...filteredHistory];
      }
      setCurrentItem(newHistoryItem);
      setIsFlipping(true);
      return [newHistoryItem, ...prevHistory];
    });
  }, []);

  const handleScanError = useCallback((errorMessage: string) => {
    console.error(`QR Scanner Error: ${errorMessage}`);
    setError(errorMessage);
    setView("home");
    setTimeout(() => setError(null), 5000);
  }, []);

  const viewItemFromHistory = useCallback((item: HistoryItem) => {
    setCurrentItem(item);
    setView("result");
  }, []);

  const handleAnimationComplete = useCallback(() => {
    setIsFlipping(false);
    setView("result");
  }, []);

  const handleStartScan = () => {
    // Prime the audio on the first user interaction to bypass autoplay policies
    if (!audioRef.current) {
      audioRef.current = new Audio(CARD_FLIP_SOUND);
    }
    setView("scanning");
  };

  const renderContent = () => {
    if (isFlipping && currentItem) {
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
            onSelectItem={viewItemFromHistory}
            onBack={() => setView("home")}
          />
        );
      case "result":
        return (
          currentItem && (
            <ResultDisplay item={currentItem} onBack={() => setView("home")} />
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

  return (
    <div className="h-screen w-screen bg-gray-900 font-sans flex flex-col">
      <main className="flex-grow overflow-y-auto relative">
        <Suspense fallback={<div className="w-full h-full bg-gray-900" />}>
          {renderContent()}
        </Suspense>
      </main>

      {view === "home" && !isFlipping && (
        <footer className="w-full p-4 bg-gray-900/80 backdrop-blur-sm border-t border-gray-700 flex justify-center items-center sticky bottom-0">
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
    </div>
  );
};

export default App;
