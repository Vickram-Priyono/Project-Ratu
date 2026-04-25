import type React from 'react';

export type View = 'home' | 'scanning' | 'result' | 'history' | 'gallery' | 'character_detail';

export interface GameDataItem {
  id: string;
  type: string; // Changed from ItemType to string for flexibility
  title: string;
  subtitle: string;
  content: string;
  imageUrl: string;
  icon: React.ComponentType<{ className?: string }>;
  characterId?: string; // References a character
  isAlibi?: boolean; // Indicates if this item is an alibi
}

export interface Character {
  id: string;
  name: string;
  role: string;
  description: string;
  imageUrl: string;
}

export interface HistoryItem extends GameDataItem {
  scannedAt: string;
}