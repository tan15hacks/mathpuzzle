import { describe, expect, it } from 'vitest';
import { createDefaultSave, migrateSave } from '../storage/SaveManager';

describe('save data', () => {
  it('creates schema version two saves', () => {
    const save = createDefaultSave(new Date('2026-07-11T00:00:00.000Z'));
    expect(save.schemaVersion).toBe(2);
    expect(save.hintTokens).toBe(6);
  });

  it('migrates legacy progress entries', () => {
    const save = migrateSave({
      schemaVersion: 1,
      progress: {
        'chapter-1-level-1': { completed: true, stars: 2 }
      }
    });
    expect(save.schemaVersion).toBe(2);
    expect(save.levels['chapter-1-level-1']?.completed).toBe(true);
    expect(save.levels['chapter-1-level-1']?.bestStars).toBe(2);
  });
});
