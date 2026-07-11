import { PuzzleRegistry } from '../puzzles/PuzzleRegistry';
import type { DifficultyTier } from '../puzzles/PuzzleTypes';
import type { GameSave, LevelProgress } from '../storage/SaveTypes';

export function starsForHints(hintsUsed: number): 1 | 2 | 3 {
  if (hintsUsed === 0) return 3;
  if (hintsUsed === 1) return 2;
  return 1;
}

export function isPuzzleUnlocked(save: GameSave, puzzleId: string): boolean {
  const puzzle = PuzzleRegistry.get(puzzleId);
  if (!puzzle) return false;
  const category = PuzzleRegistry.category(puzzle.categoryId);
  if (!category) return false;
  const index = category.puzzles.findIndex((item) => item.id === puzzleId);
  if (index <= 0) return index === 0;
  return Boolean(save.levels[category.puzzles[index - 1]!.id]?.completed);
}

export function isCategoryUnlocked(_save: GameSave, categoryId: string): boolean {
  return Boolean(PuzzleRegistry.category(categoryId));
}

/** @deprecated Categories are always unlocked. */
export function isChapterUnlocked(save: GameSave, categoryId: string): boolean {
  return isCategoryUnlocked(save, categoryId);
}

export function isTierUnlocked(
  save: GameSave,
  categoryId: string,
  tier: DifficultyTier
): boolean {
  const first = PuzzleRegistry.byTier(categoryId, tier)[0];
  return first ? isPuzzleUnlocked(save, first.id) : false;
}

export function getLevelProgress(save: GameSave, puzzleId: string): LevelProgress {
  return save.levels[puzzleId] ?? {
    completed: false,
    bestStars: 0,
    bestHintsUsed: 99,
    attempts: 0
  };
}

export function totalStars(save: GameSave): number {
  return Object.values(save.levels).reduce((sum, level) => sum + level.bestStars, 0);
}

export function completedCount(save: GameSave): number {
  return Object.values(save.levels).filter((level) => level.completed).length;
}

export function completionPercent(save: GameSave): number {
  return Math.round((completedCount(save) / PuzzleRegistry.all().length) * 100);
}

export function nextPlayablePuzzleId(save: GameSave, categoryId?: string): string {
  if (categoryId) {
    const category = PuzzleRegistry.category(categoryId);
    const next = category?.puzzles.find(
      (item) => isPuzzleUnlocked(save, item.id) && !save.levels[item.id]?.completed
    );
    return next?.id ?? category?.puzzles.at(-1)?.id ?? PuzzleRegistry.first().id;
  }

  const remembered = PuzzleRegistry.get(save.lastPlayedLevel);
  if (
    remembered &&
    isPuzzleUnlocked(save, remembered.id) &&
    !save.levels[remembered.id]?.completed
  ) {
    return remembered.id;
  }

  const puzzle = PuzzleRegistry.all().find(
    (item) => isPuzzleUnlocked(save, item.id) && !save.levels[item.id]?.completed
  );
  return puzzle?.id ?? remembered?.id ?? PuzzleRegistry.first().id;
}

export function categoryProgress(
  save: GameSave,
  categoryId: string
): { completed: number; stars: number; total: number } {
  const category = PuzzleRegistry.category(categoryId);
  if (!category) return { completed: 0, stars: 0, total: 0 };
  return category.puzzles.reduce(
    (result, puzzle) => {
      const progress = getLevelProgress(save, puzzle.id);
      result.completed += progress.completed ? 1 : 0;
      result.stars += progress.bestStars;
      return result;
    },
    { completed: 0, stars: 0, total: category.puzzles.length }
  );
}

/** @deprecated Use categoryProgress. */
export function chapterProgress(
  save: GameSave,
  categoryId: string
): { completed: number; stars: number; total: number } {
  return categoryProgress(save, categoryId);
}
