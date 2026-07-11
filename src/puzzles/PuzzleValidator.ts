import { LEVELS_PER_CATEGORY } from './data/generatedCategories';
import type { ChapterDefinition, PuzzleDefinition } from './PuzzleTypes';

export interface ValidationIssue {
  puzzleId: string;
  message: string;
}

function normalizedProblemSignature(puzzle: PuzzleDefinition): string {
  return JSON.stringify({
    category: puzzle.chapterId,
    type: puzzle.type,
    mode: puzzle.answerMode,
    data: puzzle.puzzleData,
    answers: puzzle.correctAnswers,
    signature: puzzle.signature
  });
}

export function validatePuzzle(puzzle: PuzzleDefinition): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const report = (message: string): void => {
    issues.push({ puzzleId: puzzle.id, message });
  };

  if (puzzle.correctAnswers.length === 0) report('Puzzle has no correct answer.');
  if (!puzzle.explanation.trim()) report('Puzzle has no explanation.');
  if (puzzle.solutionSteps.length === 0) report('Puzzle has no solution steps.');
  if (puzzle.hints.length !== 3) report('Puzzle must have exactly three hints.');
  if (new Set(puzzle.hints.map((hint) => hint.level)).size !== 3) {
    report('Hints must use levels 1, 2, and 3 exactly once.');
  }
  if (puzzle.answerMode === 'multiple-choice' || puzzle.answerMode === 'operator-selection') {
    if (!puzzle.choices || puzzle.choices.length < 2) {
      report('Choice-based puzzle must provide at least two choices.');
    } else {
      const normalizedChoices = puzzle.choices.map(String);
      const hasAnswer = puzzle.correctAnswers.some((answer) => normalizedChoices.includes(String(answer)));
      if (!hasAnswer) report('Choices do not contain a correct answer.');
      if (new Set(normalizedChoices).size !== normalizedChoices.length) report('Choices contain duplicates.');
    }
  }
  if (puzzle.answerMode === 'drag-and-drop' && (!puzzle.choices || puzzle.choices.length < 2)) {
    report('Drag-and-drop puzzle must provide draggable choices.');
  }
  if (puzzle.levelNumber < 1 || puzzle.levelNumber > LEVELS_PER_CATEGORY) {
    report(`Level number must be between 1 and ${LEVELS_PER_CATEGORY}.`);
  }
  if (!/^category-[a-z-]+$/.test(puzzle.chapterId)) {
    report('Category id must use the category-* format.');
  }
  if (!puzzle.difficultyBand) {
    report('Puzzle must declare a difficulty band.');
  }
  if (!puzzle.signature) {
    report('Puzzle must include a unique normalized signature.');
  }
  if (puzzle.numericTolerance !== undefined && puzzle.numericTolerance <= 0) {
    report('Numeric tolerance must be positive.');
  }
  return issues;
}

export function validateCampaign(chapters: ChapterDefinition[]): ValidationIssue[] {
  const issues = chapters.flatMap((chapter) => chapter.puzzles.flatMap(validatePuzzle));
  const ids = new Set<string>();
  const signatures = new Set<string>();

  for (const chapter of chapters) {
    if (chapter.puzzles.length < 300) {
      issues.push({ puzzleId: chapter.id, message: 'Each category must contain at least 300 puzzles.' });
    }

    const seenLevels = new Set<number>();
    for (const puzzle of chapter.puzzles) {
      if (ids.has(puzzle.id)) {
        issues.push({ puzzleId: puzzle.id, message: 'Duplicate puzzle id.' });
      }
      ids.add(puzzle.id);

      if (seenLevels.has(puzzle.levelNumber)) {
        issues.push({ puzzleId: puzzle.id, message: 'Duplicate level number inside category.' });
      }
      seenLevels.add(puzzle.levelNumber);

      const signature = normalizedProblemSignature(puzzle);
      if (signatures.has(signature)) {
        issues.push({ puzzleId: puzzle.id, message: 'Duplicate normalized puzzle signature.' });
      }
      signatures.add(signature);
    }
  }

  return issues;
}
