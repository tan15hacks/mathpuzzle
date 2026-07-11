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

  it('unlocks only the first puzzle initially', () => {
    const save = createDefaultSave();
    expect(isPuzzleUnlocked(save, 'chapter-1-level-1')).toBe(true);
    expect(isPuzzleUnlocked(save, 'chapter-1-level-2')).toBe(false);
    save.levels['chapter-1-level-1'] = {
      completed: true,
      bestStars: 3,
      bestHintsUsed: 0,
      attempts: 1
    };
    expect(isPuzzleUnlocked(save, 'chapter-1-level-2')).toBe(true);
  });

  it('unlocks the next chapter after ten completions', () => {
    const save = createDefaultSave();
    for (let level = 1; level <= 10; level += 1) {
      save.levels[`chapter-1-level-${level}`] = {
        completed: true,
        bestStars: 3,
        bestHintsUsed: 0,
        attempts: 1
      };
    }
    expect(isChapterUnlocked(save, 'chapter-2')).toBe(true);
    expect(completionPercent(save)).toBe(17);
  });
});
