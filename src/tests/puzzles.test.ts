import { describe, expect, it } from 'vitest';
import { isCorrectAnswer } from '../puzzles/AnswerValidator';
import { LEVELS_PER_CATEGORY, TOTAL_PUZZLE_COUNT } from '../puzzles/data/generatedCategories';
import { PuzzleRegistry } from '../puzzles/PuzzleRegistry';
import { validateCampaign } from '../puzzles/PuzzleValidator';

describe('campaign content', () => {
  it('contains six unlocked categories and over 1,900 puzzles', () => {
    expect(PuzzleRegistry.chapters()).toHaveLength(6);
    expect(PuzzleRegistry.all()).toHaveLength(TOTAL_PUZZLE_COUNT);
    expect(PuzzleRegistry.chapters().every((category) => category.puzzles.length === LEVELS_PER_CATEGORY)).toBe(true);
  });

  it('passes all data validation checks', () => {
    expect(validateCampaign(PuzzleRegistry.chapters())).toEqual([]);
  });

  it('accepts numeric answers safely', () => {
    const puzzle = PuzzleRegistry.get('category-sequences-level-1')!;
    expect(isCorrectAnswer(puzzle, puzzle.correctAnswers[0]!)).toBe(true);
    expect(isCorrectAnswer(puzzle, `${puzzle.correctAnswers[0]}.0`)).toBe(true);
    expect(isCorrectAnswer(puzzle, Number(puzzle.correctAnswers[0]) + 1)).toBe(false);
  });

  it('normalizes operator answers', () => {
    const puzzle = PuzzleRegistry.all().find((item) => item.answerMode === 'operator-selection')!;
    expect(isCorrectAnswer(puzzle, puzzle.correctAnswers[0]!)).toBe(true);
    expect(isCorrectAnswer({ ...puzzle, correctAnswers: ['*'] }, '×')).toBe(true);
  });
});
