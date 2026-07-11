import type { ChapterDefinition } from '../PuzzleTypes';
import { chapter1 } from './chapter1';
import { chapter2 } from './chapter2';
import { chapter3 } from './chapter3';
import { chapter4 } from './chapter4';
import { chapter5 } from './chapter5';
import { chapter6 } from './chapter6';

export const chapters: ChapterDefinition[] = [
  { id: 'chapter-1', number: 1, title: 'Number Trails', subtitle: 'Sequences and growing patterns', icon: '↗', accent: '#57D3C8', puzzles: chapter1 },
  { id: 'chapter-2', number: 2, title: 'Shape Codes', subtitle: 'Geometry and visual relationships', icon: '△', accent: '#F1C66A', puzzles: chapter2 },
  { id: 'chapter-3', number: 3, title: 'Equation Machines', subtitle: 'Inputs, outputs, and operators', icon: 'ƒ', accent: '#9DA8FF', puzzles: chapter3 },
  { id: 'chapter-4', number: 4, title: 'Grid Logic', subtitle: 'Rows, columns, and counting', icon: '▦', accent: '#62D68B', puzzles: chapter4 },
  { id: 'chapter-5', number: 5, title: 'Number Rings', subtitle: 'Opposites and circular patterns', icon: '◉', accent: '#F09BC3', puzzles: chapter5 },
  { id: 'chapter-6', number: 6, title: 'Logic Vault', subtitle: 'Mixed master challenges', icon: '◇', accent: '#E89468', puzzles: chapter6 }
];

export const allPuzzles = chapters.flatMap((chapter) => chapter.puzzles);
