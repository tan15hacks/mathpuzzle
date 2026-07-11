import { generateCategories } from './categoryGenerators';

export const categories = generateCategories();

/** @deprecated Use categories. */
export const chapters = categories;

export const allPuzzles = categories.flatMap((category) => category.puzzles);
