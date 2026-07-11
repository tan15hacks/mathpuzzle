import { describe, expect, it } from 'vitest';
import {
  completionPercent,
  isChapterUnlocked,
  isPuzzleUnlocked,
  starsForHints
} from '../progression/ProgressionManager';
import { createDefaultSave } from '../storage/SaveManager';

describe('progression', () => {
  it('awards stars only from hint usage', () => {
    expect(starsForHints(0)).toBe(3);
    expect(starsForHints(1)).toBe(2);
    expect(starsForHints(2)).toBe(1);
    expect(starsForHints(9)).toBe(1);
  });

  it('unlocks every category initially but only level one inside each category', () => {
    const save = createDefaultSave();
    expect(isChapterUnlocked(save, 'category-sequences')).toBe(true);
    expect(isChapterUnlocked(save, 'category-shapes')).toBe(true);
    expect(isPuzzleUnlocked(save, 'category-sequences-level-1')).toBe(true);
    expect(isPuzzleUnlocked(save, 'category-shapes-level-1')).toBe(true);
    expect(isPuzzleUnlocked(save, 'category-sequences-level-2')).toBe(false);
  });

  it('unlocks the next level only inside the same category', () => {
    const save = createDefaultSave();
    save.levels['category-sequences-level-1'] = {
      completed: true,
      bestStars: 3,
      bestHintsUsed: 0,
      attempts: 1
    };
    expect(isPuzzleUnlocked(save, 'category-sequences-level-2')).toBe(true);
    expect(isPuzzleUnlocked(save, 'category-sequences-level-3')).toBe(false);
    expect(isPuzzleUnlocked(save, 'category-shapes-level-2')).toBe(false);
  });

  it('calculates completion across the full 1,920-level library', () => {
    const save = createDefaultSave();
    for (let level = 1; level <= 320; level += 1) {
      save.levels[`category-sequences-level-${level}`] = {
        completed: true,
        bestStars: 3,
        bestHintsUsed: 0,
        attempts: 1
      };
    }
    expect(completionPercent(save)).toBe(17);
  });
});
