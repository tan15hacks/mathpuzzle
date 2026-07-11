import { categories } from './generatedCategories';

export const chapters = categories;

export const allPuzzles = chapters.flatMap((chapter) => chapter.puzzles);
