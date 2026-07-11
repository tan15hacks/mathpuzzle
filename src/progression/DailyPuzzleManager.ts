import { PuzzleRegistry } from '../puzzles/PuzzleRegistry';
import type { GameSave } from '../storage/SaveTypes';

export function localDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function hashDate(key: string): number {
  let hash = 2166136261;
  for (const char of key) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function dailyPuzzleId(date = new Date()): string {
  const pool = PuzzleRegistry.all().filter((puzzle) => puzzle.difficulty >= 2 && puzzle.difficulty <= 4);
  const selected = pool[hashDate(localDateKey(date)) % Math.max(pool.length, 1)] ?? PuzzleRegistry.first();
  return selected.id;
}

function dayNumber(key: string): number {
  const parts = key.split('-').map(Number);
  const year = parts[0] ?? 1970;
  const month = parts[1] ?? 1;
  const day = parts[2] ?? 1;
  return Math.floor(Date.UTC(year, month - 1, day) / 86_400_000);
}

export function calculateStreak(completedDates: string[], today = new Date()): { current: number; longest: number } {
  const uniqueDays = [...new Set(completedDates)].sort((a, b) => dayNumber(a) - dayNumber(b));
  let longest = 0;
  let run = 0;
  let previous: number | null = null;

  for (const key of uniqueDays) {
    const current = dayNumber(key);
    run = previous !== null && current === previous + 1 ? run + 1 : 1;
    longest = Math.max(longest, run);
    previous = current;
  }

  const todayNumber = dayNumber(localDateKey(today));
  const completed = new Set(uniqueDays.map(dayNumber));
  let cursor = completed.has(todayNumber) ? todayNumber : todayNumber - 1;
  let current = 0;
  while (completed.has(cursor)) {
    current += 1;
    cursor -= 1;
  }

  return { current, longest };
}

export function hasCompletedToday(save: GameSave, date = new Date()): boolean {
  return save.dailyCompletedDates.includes(localDateKey(date));
}
