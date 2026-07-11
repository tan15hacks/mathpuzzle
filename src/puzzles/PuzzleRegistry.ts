import { allPuzzles, chapters } from './data/campaign';
import type { ChapterDefinition, PuzzleDefinition } from './PuzzleTypes';

const puzzleMap = new Map(allPuzzles.map((puzzle) => [puzzle.id, puzzle]));
const chapterMap = new Map(chapters.map((chapter) => [chapter.id, chapter]));

export const PuzzleRegistry = {
  chapters: (): ChapterDefinition[] => chapters,
  all: (): PuzzleDefinition[] => allPuzzles,
  get: (id: string): PuzzleDefinition | undefined => puzzleMap.get(id),
  chapter: (id: string): ChapterDefinition | undefined => chapterMap.get(id),
  first: (): PuzzleDefinition => allPuzzles[0]!,
  next: (id: string): PuzzleDefinition | undefined => {
    const current = puzzleMap.get(id);
    if (!current) return undefined;
    const category = chapterMap.get(current.chapterId);
    return category?.puzzles.find((puzzle) => puzzle.levelNumber === current.levelNumber + 1);
  }
};
