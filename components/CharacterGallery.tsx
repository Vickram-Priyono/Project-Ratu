import React from "react";
import type { HistoryItem, Character } from "../types";
import { ChevronLeftIcon, LockIcon } from "./icons/StaticIcons";
import { charactersData } from "../services/gameService";

interface CharacterGalleryProps {
  history: HistoryItem[];
  onSelectCharacter: (character: Character) => void;
  onBack: () => void;
}

const CharacterGallery: React.FC<CharacterGalleryProps> = ({
  history,
  onSelectCharacter,
  onBack,
}) => {
  // A character is unlocked if there is any history item with their characterId
  const unlockedCharacterIds = new Set(
    history.map((item) => item.characterId).filter(Boolean)
  );

  return (
    <div className="h-full flex flex-col md:max-w-2xl md:mx-auto bg-transparent shadow-2xl">
      <header className="sticky top-0 bg-gray-900/95 backdrop-blur-sm z-10 px-4 py-4 border-b border-gray-800 flex items-center shadow-md">
        <button
          onClick={onBack}
          className="p-2 -ml-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-gray-800 active:scale-95 touch-manipulation focus:outline-none focus:ring-2 focus:ring-amber-400/50"
          aria-label="Go back"
        >
          <ChevronLeftIcon className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-bold ml-2 text-white tracking-wide">
          Gallery Karakter
        </h2>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {charactersData.map((char) => {
            const isUnlocked = unlockedCharacterIds.has(char.id);

            return (
              <div
                key={char.id}
                onClick={() => {
                  if (isUnlocked) {
                    onSelectCharacter(char);
                  }
                }}
                className={`relative aspect-[3/4] rounded-xl overflow-hidden cursor-pointer transition-all duration-300 ${
                  isUnlocked
                    ? "hover:scale-105 active:scale-95 shadow-lg border border-gray-700 hover:border-amber-400/50"
                    : "opacity-60 grayscale cursor-not-allowed border border-gray-800"
                }`}
              >
                {/* Image */}
                <div className="absolute inset-0 bg-gray-800/80 backdrop-blur-sm">
                  <img
                    src={char.imageUrl}
                    alt={char.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {!isUnlocked && (
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-[2px] flex flex-col justify-center items-center">
                      <LockIcon className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Terkunci
                      </span>
                    </div>
                  )}
                </div>

                {/* Info gradient overlay */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent p-3 pt-8">
                  <h3 className="text-white font-bold text-sm leading-tight line-clamp-1">
                    {isUnlocked ? char.name : "Karakter"}
                  </h3>
                  <p className="text-amber-400 text-xs mt-0.5 line-clamp-1">
                    {isUnlocked ? char.role : "???"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CharacterGallery;
