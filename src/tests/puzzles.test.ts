import { describe, expect, it } from 'vitest';
import { isCorrectAnswer } from '../puzzles/AnswerValidator';
import { PuzzleRegistry } from '../puzzles/PuzzleRegistry';
import { validateCampaign } from '../puzzles/PuzzleValidator';

describe('campaign content', () => {
  it('contains six chapters and sixty puzzles', () => {
    expect(PuzzleRegistry.chapters()).toHaveLength(6);
    expect(PuzzleRegistry.all()).toHaveLength(60);
    expect(PuzzleRegistry.chapters().every((chapter) => chapter.puzzles.length === 10)).toBe(true);
  });

  it('passes all data validation checks', () => {
    expect(validateCampaign(PuzzleRegistry.chapters())).toEqual([]);
  });

  it('accepts numeric answers safely', () => {
    const puzzle = PuzzleRegistry.get('chapter-1-level-1')!;
    expect(isCorrectAnswer(puzzle, 14)).toBe(true);
    expect(isCorrectAnswer(puzzle, '14.0')).toBe(true);
    expect(isCorrectAnswer(puzzle, 15)).toBe(false);
  });

  it('normalizes operator answers', () => {
    const puzzle = PuzzleRegistry.get('chapter-3-level-4')!;
    expect(isCorrectAnswer(puzzle, '×')).toBe(true);
    expect(isCorrectAnswer({ ...puzzle, correctAnswers: ['*'] }, '×')).toBe(true);
  });
});
