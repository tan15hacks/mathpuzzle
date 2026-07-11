export interface LevelProgress {
  completed: boolean;
  bestStars: 0 | 1 | 2 | 3;
  bestHintsUsed: number;
  attempts: number;
  completedAt?: string;
}

export interface GameSettings {
  musicVolume: number;
  soundVolume: number;
  vibration: boolean;
  reducedMotion: boolean;
  highContrast: boolean;
  largeText: boolean;
}

export interface GameStatistics {
  totalAttempts: number;
  totalHintsUsed: number;
  solvedWithoutHints: number;
  dailySolved: number;
  rewardedAdsWatched: number;
}

export interface GameSave {
  schemaVersion: 3;
  appVersion: string;
  levels: Record<string, LevelProgress>;
  hintTokens: number;
  lastPlayedLevel: string;
  dailyCompletedDates: string[];
  dailyRewardDates: string[];
  currentStreak: number;
  longestStreak: number;
  settings: GameSettings;
  statistics: GameStatistics;
  createdAt: string;
  updatedAt: string;
}
