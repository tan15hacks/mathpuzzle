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
    const index = allPuzzles.findIndex((puzzle) => puzzle.id === id);
    return index >= 0 ? allPuzzles[index + 1] : undefined;
  }
};
