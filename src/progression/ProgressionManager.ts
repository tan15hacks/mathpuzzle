import { PuzzleRegistry } from '../puzzles/PuzzleRegistry';
import type { GameSave, LevelProgress } from '../storage/SaveTypes';

export function starsForHints(hintsUsed: number): 1 | 2 | 3 {
  if (hintsUsed === 0) return 3;
  if (hintsUsed === 1) return 2;
  return 1;
}

export function isPuzzleUnlocked(save: GameSave, puzzleId: string): boolean {
  const puzzles = PuzzleRegistry.all();
  const index = puzzles.findIndex((puzzle) => puzzle.id === puzzleId);
  if (index <= 0) return index === 0;
  return Boolean(save.levels[puzzles[index - 1]!.id]?.completed);
}

export function isChapterUnlocked(save: GameSave, chapterId: string): boolean {
  const chapters = PuzzleRegistry.chapters();
  const index = chapters.findIndex((chapter) => chapter.id === chapterId);
  if (index <= 0) return index === 0;
  return chapters[index - 1]!.puzzles.every((puzzle) => save.levels[puzzle.id]?.completed);
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

export function nextPlayablePuzzleId(save: GameSave): string {
  const puzzle = PuzzleRegistry.all().find((item) => isPuzzleUnlocked(save, item.id) && !save.levels[item.id]?.completed);
  return puzzle?.id ?? save.lastPlayedLevel ?? PuzzleRegistry.first().id;
}

export function chapterProgress(save: GameSave, chapterId: string): { completed: number; stars: number } {
  const chapter = PuzzleRegistry.chapter(chapterId);
  if (!chapter) return { completed: 0, stars: 0 };
  return chapter.puzzles.reduce(
    (result, puzzle) => {
      const progress = getLevelProgress(save, puzzle.id);
      result.completed += progress.completed ? 1 : 0;
      result.stars += progress.bestStars;
      return result;
    },
    { completed: 0, stars: 0 }
  );
}
