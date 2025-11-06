import type React from 'react';

export type View = 'home' | 'scanning' | 'result' | 'history';

// Using a const object for better tree-shaking and to avoid enum issues with some TS configs.
export const ItemTypes = {
  EVIDENCE: 'EVIDENCE',
  WITNESS: 'WITNESS',
  LOCATION: 'LOCATION',
  FORENSICS: 'FORENSICS',
} as const;

export type ItemType = typeof ItemTypes[keyof typeof ItemTypes];

export interface GameDataItem {
  id: string;
  type: ItemType;
  title: string;
  subtitle: string;
  content: string;
  imageUrl: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface HistoryItem extends GameDataItem {
  scannedAt: string;
}