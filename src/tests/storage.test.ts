import { describe, expect, it } from 'vitest';
import { createDefaultSave, migrateSave } from '../storage/SaveManager';

describe('save data', () => {
  it('creates schema version two saves', () => {
    const save = createDefaultSave(new Date('2026-07-11T00:00:00.000Z'));
    expect(save.schemaVersion).toBe(2);
    expect(save.hintTokens).toBe(6);
    expect(save.lastPlayedLevel).toBe('category-sequences-level-1');
  });

  it('migrates legacy progress entries', () => {
    const save = migrateSave({
      schemaVersion: 1,
      progress: {
        'category-sequences-level-1': { completed: true, stars: 2 }
      }
    });
    expect(save.schemaVersion).toBe(2);
    expect(save.levels['category-sequences-level-1']?.completed).toBe(true);
    expect(save.levels['category-sequences-level-1']?.bestStars).toBe(2);
  });
});
