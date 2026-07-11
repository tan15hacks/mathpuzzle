import { describe, expect, it } from 'vitest';
import { isCorrectAnswer } from '../puzzles/AnswerValidator';
import { PuzzleRegistry } from '../puzzles/PuzzleRegistry';
import { validateCampaign } from '../puzzles/PuzzleValidator';

describe('category content', () => {
  it('contains six categories and 1,920 puzzles', () => {
    expect(PuzzleRegistry.categories()).toHaveLength(6);
    expect(PuzzleRegistry.all()).toHaveLength(1920);
    expect(
      PuzzleRegistry.categories().every((category) => category.puzzles.length === 320)
    ).toBe(true);
  });

  it('contains eighty levels in every difficulty tier', () => {
    for (const category of PuzzleRegistry.categories()) {
      expect(PuzzleRegistry.byTier(category.id, 'easy')).toHaveLength(80);
      expect(PuzzleRegistry.byTier(category.id, 'normal')).toHaveLength(80);
      expect(PuzzleRegistry.byTier(category.id, 'advanced')).toHaveLength(80);
      expect(PuzzleRegistry.byTier(category.id, 'expert')).toHaveLength(80);
    }
  });

  it('passes duplicate, content, and data validation', () => {
    expect(validateCampaign(PuzzleRegistry.categories())).toEqual([]);
    expect(new Set(PuzzleRegistry.all().map((puzzle) => puzzle.id)).size).toBe(1920);
    expect(
      new Set(PuzzleRegistry.all().map((puzzle) => puzzle.uniquenessKey)).size
    ).toBe(1920);
  });

  it('accepts every authored correct answer', () => {
    for (const puzzle of PuzzleRegistry.all()) {
      expect(
        isCorrectAnswer(puzzle, puzzle.correctAnswers[0]!),
        `${puzzle.id} should accept its primary answer`
      ).toBe(true);
    }
  });

  it('normalizes operator answers', () => {
    const puzzle = PuzzleRegistry.all().find(
      (item) => item.answerMode === 'operator-selection' && item.correctAnswers[0] === '×'
    )!;
    expect(isCorrectAnswer(puzzle, '×')).toBe(true);
    expect(isCorrectAnswer({ ...puzzle, correctAnswers: ['*'] }, '×')).toBe(true);
  });
});
