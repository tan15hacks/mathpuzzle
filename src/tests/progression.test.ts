import { describe, expect, it } from 'vitest';
import {
  completionPercent,
  isCategoryUnlocked,
  isPuzzleUnlocked,
  isTierUnlocked,
  starsForHints
} from '../progression/ProgressionManager';
import { createDefaultSave } from '../storage/SaveManager';

describe('category progression', () => {
  it('awards stars only from hint usage', () => {
    expect(starsForHints(0)).toBe(3);
    expect(starsForHints(1)).toBe(2);
    expect(starsForHints(2)).toBe(1);
    expect(starsForHints(9)).toBe(1);
  });

  it('keeps every category available from the beginning', () => {
    const save = createDefaultSave();
    for (const categoryId of [
      'number-patterns',
      'shape-logic',
      'equation-machines',
      'grid-logic',
      'number-rings',
      'logic-mix'
    ]) {
      expect(isCategoryUnlocked(save, categoryId)).toBe(true);
      expect(isPuzzleUnlocked(save, `${categoryId}-level-1`)).toBe(true);
    }
  });

  it('unlocks levels progressively inside each category', () => {
    const save = createDefaultSave();
    expect(isPuzzleUnlocked(save, 'number-patterns-level-2')).toBe(false);
    save.levels['number-patterns-level-1'] = {
      completed: true,
      bestStars: 3,
      bestHintsUsed: 0,
      attempts: 1
    };
    expect(isPuzzleUnlocked(save, 'number-patterns-level-2')).toBe(true);
    expect(isPuzzleUnlocked(save, 'shape-logic-level-2')).toBe(false);
  });

  it('unlocks difficulty tiers after the previous eighty levels', () => {
    const save = createDefaultSave();
    expect(isTierUnlocked(save, 'number-patterns', 'easy')).toBe(true);
    expect(isTierUnlocked(save, 'number-patterns', 'normal')).toBe(false);

    for (let level = 1; level <= 80; level += 1) {
      save.levels[`number-patterns-level-${level}`] = {
        completed: true,
        bestStars: 3,
        bestHintsUsed: 0,
        attempts: 1
      };
    }
    expect(isTierUnlocked(save, 'number-patterns', 'normal')).toBe(true);
  });

  it('calculates total completion across all categories', () => {
    const save = createDefaultSave();
    for (let level = 1; level <= 320; level += 1) {
      save.levels[`number-patterns-level-${level}`] = {
        completed: true,
        bestStars: 3,
        bestHintsUsed: 0,
        attempts: 1
      };
    }
    expect(completionPercent(save)).toBe(17);
  });
});
