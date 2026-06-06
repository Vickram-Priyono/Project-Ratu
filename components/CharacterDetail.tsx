import React, { useState, useEffect, useRef } from "react";
import type { HistoryItem, Character } from "../types";
import { ChevronLeftIcon, LockIcon, PlayIcon, PauseIcon, WitnessIcon } from "./icons/StaticIcons";

interface CharacterDetailProps {
  character: Character;
  history: HistoryItem[];
  onBack: () => void;
}

const CharacterDetail: React.FC<CharacterDetailProps> = ({
  character,
  history,
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState<"biodata" | "alibi">("biodata");
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Find all items related to this character
  const characterItems = history.filter(
    (item) => item.characterId === character.id
  );

  // Find alibi item
  const alibiItem = characterItems.find((item) => item.isAlibi);

  useEffect(() => {
    if (alibiItem?.audioUrl) {
      audioRef.current = new Audio(alibiItem.audioUrl);
      audioRef.current.onended = () => setIsPlaying(false);
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [alibiItem]);

  // Pause audio when switching tabs
  useEffect(() => {
    if (activeTab !== "alibi" && isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, [activeTab, isPlaying]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch((e) => console.error("Error playing audio", e));
      setIsPlaying(true);
    }
  };

  return (
    <div className="w-full h-full bg-transparent flex flex-col animate-fade-in relative">
      {/* Floating Back Button */}
      <button 
        onClick={onBack} 
        className="absolute top-4 left-4 p-2.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/15 z-20 transition-all active:scale-95 shadow-lg"
        aria-label="Go back"
      >
        <ChevronLeftIcon className="w-6 h-6 text-white" />
      </button>

      <div className="flex-grow overflow-y-auto p-4 pt-4 pb-24">
        <div className="max-w-xl mx-auto flex flex-col gap-5">
          {/* Top Mugshot Profile Photo */}
          <div className="w-full bg-black rounded-sm shadow-[0_6px_20px_rgba(0,0,0,0.6)] overflow-hidden border-4 border-black relative">
            <img
              src={character.imageUrl}
              alt={character.name}
              className="w-full h-auto object-cover border border-white/10"
              style={{ aspectRatio: "1/1" }}
            />
          </div>

          {/* Sub Tab Navigation */}
          <div className="flex bg-slate-800/60 backdrop-blur-md rounded-xl p-1 border border-slate-700/80 shadow-md">
            <button
              onClick={() => setActiveTab("biodata")}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
                activeTab === "biodata"
                  ? "bg-amber-400 text-slate-900 shadow-lg font-bold"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              Biodata
            </button>
            <button
              onClick={() => setActiveTab("alibi")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
                activeTab === "alibi"
                  ? "bg-amber-400 text-slate-900 shadow-lg font-bold"
                  : "text-slate-300 hover:text-amber-400"
              }`}
            >
              Alibi
              {!alibiItem && <LockIcon className="w-4 h-4 opacity-75" />}
            </button>
          </div>

          {/* Elegant Content Card Container */}
          <div className="bg-slate-700/80 backdrop-blur-md p-5 rounded-2xl border border-slate-600 shadow-2xl">
            {/* Biodata View */}
            {activeTab === "biodata" && (
              <div className="space-y-5 animate-fade-in text-left">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-slate-800 rounded-xl flex-shrink-0 border border-slate-700/50 shadow-inner">
                    <WitnessIcon className="w-7 h-7 text-amber-400" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-white tracking-wide">{character.name}</h1>
                    <p className="text-sm font-medium text-slate-300">{character.role}</p>
                  </div>
                </div>

                <hr className="border-slate-600" />

                <div className="space-y-4">
                  <div>
                    <h3 className="text-xs font-bold text-amber-400/80 uppercase tracking-wider mb-2">
                      Informasi Karakter
                    </h3>
                    <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">
                      {character.description}
                    </p>
                  </div>

                  {characterItems.length > 0 && (
                    <div className="pt-2">
                      <h3 className="text-xs font-bold text-amber-400/80 uppercase tracking-wider mb-2">
                        Pernyataan / Bukti Lainnya ({characterItems.length})
                      </h3>
                      <ul className="space-y-2">
                        {characterItems.map((item) => (
                          <li
                            key={item.id}
                            className="bg-slate-800/40 p-3 rounded-lg border border-slate-700 text-sm text-slate-300 flex items-start gap-3"
                          >
                            <div className="mt-0.5 text-amber-400/80 flex-shrink-0">
                              <item.icon className="w-4 h-4" />
                            </div>
                            <span className="font-medium">{item.title}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Alibi View */}
            {activeTab === "alibi" && (
              <div className="animate-fade-in text-left">
                {alibiItem ? (
                  <div className="space-y-5">
                    <div className="flex items-center gap-4">
                      {/* Avatar / Profile line icon container */}
                      <div className="p-3 bg-slate-800 rounded-xl flex-shrink-0 border border-slate-700/50 shadow-inner">
                        <WitnessIcon className="w-7 h-7 text-amber-400" />
                      </div>
                      
                      {/* Texts and audio play button row */}
                      <div className="flex-grow flex justify-between items-center gap-2">
                        <div>
                          <h1 className="text-2xl font-bold text-white tracking-wide">{character.name}</h1>
                          <p className="text-sm font-medium text-slate-300">{character.role}</p>
                        </div>
                        {alibiItem.audioUrl && (
                          <button
                            onClick={togglePlay}
                            className={`flex-shrink-0 flex items-center justify-center p-2.5 rounded-full border-2 transition-all duration-300 ${
                              isPlaying 
                                ? "border-amber-400 text-amber-400 bg-amber-400/20 shadow-[0_0_15px_rgba(251,191,36,0.3)]" 
                                : "border-amber-500/80 text-amber-500 hover:bg-amber-500/10 hover:border-amber-400 hover:text-amber-400"
                            }`}
                            aria-label={isPlaying ? "Pause Audio" : "Play Audio"}
                          >
                            {isPlaying ? (
                              <PauseIcon className="w-5 h-5" />
                            ) : (
                              <PlayIcon className="w-5 h-5 ml-0.5" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    <hr className="border-slate-600" />

                    <div className="space-y-4 text-slate-200">
                      {alibiItem.content.split('\n').map((paragraph, idx) => (
                        <p key={idx} className="leading-relaxed whitespace-pre-wrap">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center text-slate-300">
                    <div className="p-4 bg-slate-800/80 rounded-full border border-slate-700 mb-4 shadow-lg">
                      <LockIcon className="w-10 h-10 text-amber-400/80 animate-pulse" />
                    </div>
                    <p className="font-semibold text-white mb-2">Alibi Terkunci</p>
                    <p className="text-sm text-slate-400 max-w-[280px] leading-relaxed">
                      Pernyataan alibi karakter ini masih terkunci. Harap pindai QR code spesifik karakter ini untuk membukanya.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterDetail;
