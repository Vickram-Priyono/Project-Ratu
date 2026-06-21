import React, { useState } from "react";
import type { HistoryItem, Character } from "../types";
import { ChevronLeftIcon, WitnessIcon } from "./icons/StaticIcons";

interface CharacterDetailProps {
  character: Character;
  history: HistoryItem[];
  onBack: () => void;
  onSelectItem?: (item: HistoryItem) => void;
}

const CharacterDetail: React.FC<CharacterDetailProps> = ({
  character,
  history,
  onBack,
  onSelectItem,
}) => {
  const [activeTab, setActiveTab] = useState<"biodata" | "alibi">("biodata");

  // Find all items related to this character
  const characterItems = history.filter(
    (item) => item.characterId === character.id
  );

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
          <div className="w-full rounded-2xl overflow-hidden shadow-[0_6px_20px_rgba(0,0,0,0.6)] border border-slate-700/50 relative">
            <img
              src={character.imageUrl}
              alt={character.name}
              className="w-full h-auto block"
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
                </div>
              </div>
            )}

            {/* Alibi View */}
            {activeTab === "alibi" && (
              <div className="animate-fade-in text-left space-y-4">
                <div className="flex items-center gap-4 mb-2">
                  <div className="p-3 bg-slate-800 rounded-xl flex-shrink-0 border border-slate-700/50 shadow-inner">
                    <WitnessIcon className="w-7 h-7 text-amber-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white tracking-wide">Pernyataan & Barang Bukti</h2>
                    <p className="text-xs text-slate-400">Ditemukan: {characterItems.length} item</p>
                  </div>
                </div>

                <hr className="border-slate-600" />

                {characterItems.length > 0 ? (
                  <ul className="space-y-2">
                    {characterItems.map((item) => (
                      <li key={item.id}>
                        <button
                          onClick={() => onSelectItem?.(item)}
                          className="w-full text-left bg-slate-800/45 hover:bg-slate-700/50 hover:border-amber-400/50 p-3 rounded-lg border border-slate-700 text-sm text-slate-300 flex items-start gap-3 transition-all duration-200 active:scale-[0.99] cursor-pointer focus:outline-none focus:ring-1 focus:ring-amber-400/50"
                        >
                          <div className="mt-0.5 text-amber-400/80 flex-shrink-0">
                            <item.icon className="w-4 h-4" />
                          </div>
                          <span className="font-medium flex-grow text-sm truncate">{item.title}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-8 text-sm text-slate-400 italic">
                    Belum ada pernyataan atau barang bukti yang telah di-scan untuk karakter ini.
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
