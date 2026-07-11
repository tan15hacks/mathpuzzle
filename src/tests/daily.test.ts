import { describe, expect, it } from 'vitest';
import { calculateStreak, dailyPuzzleId, localDateKey } from '../progression/DailyPuzzleManager';

describe('daily puzzles', () => {
  it('selects deterministically for a local date', () => {
    const date = new Date(2026, 6, 11, 10, 0, 0);
    expect(dailyPuzzleId(date)).toBe(dailyPuzzleId(date));
    expect(localDateKey(date)).toBe('2026-07-11');
  });

  it('calculates current and longest streaks across date boundaries', () => {
    const result = calculateStreak(
      ['2026-07-06', '2026-07-07', '2026-07-09', '2026-07-10', '2026-07-11'],
      new Date(2026, 6, 11, 12)
    );
    expect(result.current).toBe(3);
    expect(result.longest).toBe(3);
  });

  it('keeps yesterday active when today is not yet completed', () => {
    const result = calculateStreak(
      ['2026-07-09', '2026-07-10'],
      new Date(2026, 6, 11, 8)
    );
    expect(result.current).toBe(2);
  });
});
