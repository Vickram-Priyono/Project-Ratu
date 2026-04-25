import React, { useState } from "react";
import type { HistoryItem, Character } from "../types";
import { ChevronLeftIcon, LockIcon } from "./icons/StaticIcons";

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

  // Find all items related to this character
  const characterItems = history.filter(
    (item) => item.characterId === character.id
  );

  // Find alibi item
  const alibiItem = characterItems.find((item) => item.isAlibi);

  return (
    <div className="h-full flex flex-col md:max-w-2xl md:mx-auto bg-gray-900 shadow-2xl">
      <header className="sticky top-0 bg-gray-900/95 backdrop-blur-sm z-10 px-4 py-4 border-b border-gray-800 flex items-center shadow-md">
        <button
          onClick={onBack}
          className="p-2 -ml-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-gray-800 active:scale-95 touch-manipulation focus:outline-none focus:ring-2 focus:ring-amber-400/50"
          aria-label="Go back"
        >
          <ChevronLeftIcon className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-bold ml-2 text-white tracking-wide">
          Profil Karakter
        </h2>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="p-6 pb-8">
          <div className="flex flex-col items-center">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-gray-800 overflow-hidden shadow-xl mb-4 bg-gray-800 relative">
              <img
                src={character.imageUrl}
                alt={character.name}
                className="w-full h-full object-cover"
              />
            </div>
            <h1 className="text-2xl font-bold text-white mb-1 leading-tight text-center">
              {character.name}
            </h1>
            <p className="text-amber-400 font-medium mb-6">{character.role}</p>

            {/* Tabs */}
            <div className="w-full flex bg-gray-800 rounded-lg p-1 mb-6">
              <button
                onClick={() => setActiveTab("biodata")}
                className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${
                  activeTab === "biodata"
                    ? "bg-gray-700 text-white shadow"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                Biodata
              </button>
              <button
                onClick={() => setActiveTab("alibi")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-md transition-colors ${
                  activeTab === "alibi"
                    ? "bg-gray-700 text-amber-400 shadow"
                    : "text-gray-400 hover:text-amber-400/70"
                }`}
              >
                Alibi
                {!alibiItem && <LockIcon className="w-4 h-4 opacity-70" />}
              </button>
            </div>

            {/* Content Area */}
            <div className="w-full text-left">
              {activeTab === "biodata" && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
                      Informasi
                    </h3>
                    <p className="text-gray-300 leading-relaxed text-base">
                      {character.description}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
                      Catatan Ditemukan ({characterItems.length})
                    </h3>
                    {characterItems.length > 0 ? (
                      <ul className="space-y-2">
                        {characterItems.map((item) => (
                          <li
                            key={item.id}
                            className="bg-gray-800/50 p-3 rounded-lg border border-gray-700 text-sm text-gray-300 flex items-start gap-3"
                          >
                            <div className="mt-0.5 text-amber-400/80">
                              <item.icon className="w-4 h-4" />
                            </div>
                            <span>{item.title}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500 italic text-sm">Belum ada data lainnya.</p>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "alibi" && (
                <div className="animate-fade-in">
                  {alibiItem ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 border-b border-gray-700 pb-4 mb-4">
                        <div className="p-2 bg-amber-400/10 rounded-lg">
                          <alibiItem.icon className="w-6 h-6 text-amber-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">
                            Pernyataan Alibi
                          </h3>
                          <p className="text-xs text-gray-400">
                            Diperoleh dari {alibiItem.title}
                          </p>
                        </div>
                      </div>
                      <div className="prose prose-invert max-w-none text-gray-300">
                        {alibiItem.content.split('\n').map((paragraph, idx) => (
                          <p key={idx} className="mb-4 leading-relaxed whitespace-pre-wrap">
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center text-gray-500">
                      <LockIcon className="w-12 h-12 mb-4 opacity-50" />
                      <p className="mb-2 max-w-[250px]">
                        Alibi terkunci. Pindai QR code spesifik karakter ini untuk membukanya.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterDetail;
