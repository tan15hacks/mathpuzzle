import { describe, expect, it } from 'vitest';
import { createDefaultSave, migrateSave } from '../storage/SaveManager';

describe('save data', () => {
  it('creates schema version three saves', () => {
    const save = createDefaultSave(new Date('2026-07-11T00:00:00.000Z'));
    expect(save.schemaVersion).toBe(3);
    expect(save.hintTokens).toBe(6);
    expect(save.lastPlayedLevel).toBe('number-patterns-level-1');
    expect(save.statistics.rewardedAdsWatched).toBe(0);
  });

  it('migrates legacy chapter progress into categories', () => {
    const save = migrateSave({
      schemaVersion: 1,
      progress: {
        'chapter-1-level-1': { completed: true, stars: 2 },
        'chapter-6-level-4': { completed: true, stars: 3 }
      },
      lastPlayedLevel: 'chapter-2-level-3'
    });

    expect(save.schemaVersion).toBe(3);
    expect(save.levels['number-patterns-level-1']?.completed).toBe(true);
    expect(save.levels['number-patterns-level-1']?.bestStars).toBe(2);
    expect(save.levels['logic-mix-level-4']?.bestStars).toBe(3);
    expect(save.lastPlayedLevel).toBe('shape-logic-level-3');
  });
});
