import React, { useState, useEffect, useRef } from 'react';
import type { HistoryItem } from '../types';
import { ChevronLeftIcon, PlayIcon, PauseIcon } from './icons/StaticIcons';

interface ResultDisplayProps {
  item: HistoryItem;
  onBack: () => void;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ item, onBack }) => {
  const [imageError, setImageError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Reset image error state when the item changes
  useEffect(() => {
    setImageError(false);
  }, [item.imageUrl]);

  useEffect(() => {
    if (item.audioUrl) {
      audioRef.current = new Audio(item.audioUrl);
      audioRef.current.onended = () => setIsPlaying(false);
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [item.audioUrl]);

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
      <button 
        onClick={onBack} 
        className="absolute top-4 left-4 p-2 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur border border-white/10 z-20 transition-colors"
        aria-label="Go back"
      >
        <ChevronLeftIcon className="w-6 h-6 text-white" />
      </button>

      <div className="flex-grow overflow-y-auto p-4 pt-16">
        <div className="max-w-xl mx-auto flex flex-col gap-6">
          <div className="w-full aspect-square rounded-2xl overflow-hidden shadow-[0_6px_20px_rgba(0,0,0,0.6)] border border-slate-700/50 relative bg-slate-800">
            {!imageError ? (
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover object-center block"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full aspect-square bg-gray-800 flex flex-col items-center justify-center text-center p-4 border border-red-500/30">
                <p className="font-semibold text-red-400">Image Not Found</p>
                <p className="text-xs text-gray-400 mt-2">
                  Could not load image from:
                </p>
                <code className="text-xs bg-gray-900 p-1 rounded mt-1 break-all text-left">{item.imageUrl}</code>
              </div>
            )}
          </div>

          <div className="bg-slate-700/80 backdrop-blur-md p-5 rounded-2xl border border-slate-600 shadow-2xl">
            <div className="flex items-center gap-4 mb-5">
              <div className="p-3 bg-slate-800 rounded-xl flex-shrink-0 border border-slate-700/50 shadow-inner">
                <item.icon className="w-7 h-7 text-amber-400" />
              </div>
              <div className="flex-grow flex justify-between items-center gap-2">
                <div>
                  <h1 className="text-2xl font-bold text-white tracking-wide">{item.title}</h1>
                  <p className="text-sm font-medium text-slate-300">{item.subtitle}</p>
                </div>
                {item.audioUrl && (
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
            <div className="space-y-4 text-slate-200">
              {item.content.split('\n').map((paragraph, index) => (
                <p key={index} className="leading-relaxed whitespace-pre-wrap">{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ResultDisplay);
