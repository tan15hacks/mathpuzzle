import type { GameSave, LevelProgress } from './SaveTypes';

const STORAGE_KEY = 'number-nexus-save';
const SCHEMA_VERSION = 3 as const;
const CATEGORY_ID_MAP: Record<string, string> = {
  'chapter-1': 'number-patterns',
  'chapter-2': 'shape-logic',
  'chapter-3': 'equation-machines',
  'chapter-4': 'grid-logic',
  'chapter-5': 'number-rings',
  'chapter-6': 'logic-mix'
};

export function createDefaultSave(now = new Date()): GameSave {
  const timestamp = now.toISOString();
  return {
    schemaVersion: SCHEMA_VERSION,
    appVersion: '1.1.0',
    levels: {},
    hintTokens: 6,
    lastPlayedLevel: 'number-patterns-level-1',
    dailyCompletedDates: [],
    dailyRewardDates: [],
    currentStreak: 0,
    longestStreak: 0,
    settings: {
      musicVolume: 0,
      soundVolume: 0.8,
      vibration: true,
      reducedMotion: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false,
      highContrast: false,
      largeText: false
    },
    statistics: {
      totalAttempts: 0,
      totalHintsUsed: 0,
      solvedWithoutHints: 0,
      dailySolved: 0,
      rewardedAdsWatched: 0
    },
    createdAt: timestamp,
    updatedAt: timestamp
  };
}

interface LegacySave {
  schemaVersion?: number;
  progress?: Record<string, { stars?: number; completed?: boolean }>;
  levels?: Record<string, LevelProgress>;
  hintTokens?: number;
  lastPlayedLevel?: string;
  dailyCompletedDates?: string[];
  dailyRewardDates?: string[];
  currentStreak?: number;
  longestStreak?: number;
  settings?: Partial<GameSave['settings']>;
  statistics?: Partial<GameSave['statistics']>;
  createdAt?: string;
  updatedAt?: string;
}

function migrateLevelId(id: string): string {
  const match = /^chapter-([1-6])-level-(\d+)$/.exec(id);
  if (!match) return id;
  const categoryId = CATEGORY_ID_MAP[`chapter-${match[1]}`];
  return categoryId ? `${categoryId}-level-${match[2]}` : id;
}

function migrateLevels(legacy: LegacySave): Record<string, LevelProgress> {
  const source: Record<string, LevelProgress> = legacy.levels ?? Object.fromEntries(
    Object.entries(legacy.progress ?? {}).map(([id, progress]) => [
      id,
      {
        completed: progress.completed ?? false,
        bestStars: Math.min(3, Math.max(0, progress.stars ?? 0)) as 0 | 1 | 2 | 3,
        bestHintsUsed: 3,
        attempts: 0
      }
    ])
  );

  const migrated: Record<string, LevelProgress> = {};
  for (const [id, progress] of Object.entries(source)) {
    const nextId = migrateLevelId(id);
    const existing = migrated[nextId];
    migrated[nextId] = existing
      ? {
          completed: existing.completed || progress.completed,
          bestStars: Math.max(existing.bestStars, progress.bestStars) as 0 | 1 | 2 | 3,
          bestHintsUsed: Math.min(existing.bestHintsUsed, progress.bestHintsUsed),
          attempts: existing.attempts + progress.attempts,
          completedAt: existing.completedAt ?? progress.completedAt
        }
      : progress;
  }
  return migrated;
}

export function migrateSave(raw: unknown): GameSave {
  const defaults = createDefaultSave();
  if (!raw || typeof raw !== 'object') return defaults;
  const legacy = raw as LegacySave;
  const migratedLastPlayed = migrateLevelId(
    legacy.lastPlayedLevel ?? defaults.lastPlayedLevel
  );

  return {
    ...defaults,
    ...legacy,
    schemaVersion: SCHEMA_VERSION,
    appVersion: '1.1.0',
    levels: migrateLevels(legacy),
    lastPlayedLevel: migratedLastPlayed,
    settings: { ...defaults.settings, ...legacy.settings },
    statistics: { ...defaults.statistics, ...legacy.statistics },
    dailyCompletedDates: [...new Set(legacy.dailyCompletedDates ?? [])],
    dailyRewardDates: [...new Set(legacy.dailyRewardDates ?? [])],
    updatedAt: new Date().toISOString()
  };
}

export class SaveManager {
  private save: GameSave;
  private listeners = new Set<(save: GameSave) => void>();

  constructor() {
    this.save = this.load();
  }

  get(): GameSave {
    return structuredClone(this.save);
  }

  update(mutator: (draft: GameSave) => void): GameSave {
    const draft = structuredClone(this.save);
    mutator(draft);
    draft.updatedAt = new Date().toISOString();
    this.save = draft;
    this.persist();
    this.listeners.forEach((listener) => listener(this.get()));
    return this.get();
  }

  subscribe(listener: (save: GameSave) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  reset(): GameSave {
    this.save = createDefaultSave();
    this.persist();
    this.listeners.forEach((listener) => listener(this.get()));
    return this.get();
  }

  private load(): GameSave {
    try {
      const serialized = localStorage.getItem(STORAGE_KEY);
      return serialized ? migrateSave(JSON.parse(serialized) as unknown) : createDefaultSave();
    } catch {
      return createDefaultSave();
    }
  }

  private persist(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.save));
    } catch (error) {
      console.error('Unable to save Number Nexus progress.', error);
    }
  }
}
