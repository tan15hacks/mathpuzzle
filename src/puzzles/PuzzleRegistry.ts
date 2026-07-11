import { allPuzzles, categories } from './data/campaign';
import type { CategoryDefinition, DifficultyTier, PuzzleDefinition } from './PuzzleTypes';

const puzzleMap = new Map(allPuzzles.map((puzzle) => [puzzle.id, puzzle]));
const categoryMap = new Map(categories.map((category) => [category.id, category]));

export const PuzzleRegistry = {
  categories: (): CategoryDefinition[] => categories,
  chapters: (): CategoryDefinition[] => categories,
  all: (): PuzzleDefinition[] => allPuzzles,
  get: (id: string): PuzzleDefinition | undefined => puzzleMap.get(id),
  category: (id: string): CategoryDefinition | undefined => categoryMap.get(id),
  chapter: (id: string): CategoryDefinition | undefined => categoryMap.get(id),
  first: (categoryId?: string): PuzzleDefinition => {
    if (categoryId) return categoryMap.get(categoryId)?.puzzles[0] ?? allPuzzles[0]!;
    return allPuzzles[0]!;
  },
  byTier: (categoryId: string, tier: DifficultyTier): PuzzleDefinition[] =>
    categoryMap.get(categoryId)?.puzzles.filter((puzzle) => puzzle.difficultyTier === tier) ?? [],
  next: (id: string): PuzzleDefinition | undefined => {
    const current = puzzleMap.get(id);
    if (!current) return undefined;
    const category = categoryMap.get(current.categoryId);
    if (!category) return undefined;
    const index = category.puzzles.findIndex((puzzle) => puzzle.id === id);
    return index >= 0 ? category.puzzles[index + 1] : undefined;
  }
};
