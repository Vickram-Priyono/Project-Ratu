import type React from "react";

export type View = "home" | "scanning" | "result" | "history";

export interface GameDataItem {
  id: string;
  type: string; // Changed from ItemType to string for flexibility
  title: string;
  subtitle: string;
  content: string;
  imageUrl: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface HistoryItem extends GameDataItem {
  scannedAt: string;
}
