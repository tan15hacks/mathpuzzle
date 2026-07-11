import type { CategoryDefinition, PuzzleDefinition, PuzzleData } from './PuzzleTypes';

export interface ValidationIssue {
  puzzleId: string;
  message: string;
}

function stableData(data: PuzzleData): string {
  return JSON.stringify(data, (_key, value: unknown) => {
    if (typeof value === 'number' && Object.is(value, -0)) return 0;
    return value;
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
  if (!puzzle.uniquenessKey.trim()) report('Puzzle has no uniqueness key.');
  if (!puzzle.categoryId.trim()) report('Puzzle has no category id.');
  if (!['easy', 'normal', 'advanced', 'expert'].includes(puzzle.difficultyTier)) {
    report('Puzzle has an invalid difficulty tier.');
  }
  if (puzzle.answerMode === 'multiple-choice' || puzzle.answerMode === 'operator-selection') {
    if (!puzzle.choices || puzzle.choices.length < 2) {
      report('Choice-based puzzle must provide at least two choices.');
    } else {
      const normalizedChoices = puzzle.choices.map(String);
      const hasAnswer = puzzle.correctAnswers.some((answer) => normalizedChoices.includes(String(answer)));
      if (!hasAnswer) report('Choices do not contain a correct answer.');
      if (new Set(normalizedChoices).size !== normalizedChoices.length) {
        report('Choices contain duplicate values.');
      }
    }
  }
  if (puzzle.answerMode === 'drag-and-drop' && (!puzzle.choices || puzzle.choices.length < 2)) {
    report('Drag-and-drop puzzle must provide draggable choices.');
  }
  if (puzzle.levelNumber < 1 || puzzle.levelNumber > 320) {
    report('Level number must be between 1 and 320.');
  }
  if (puzzle.numericTolerance !== undefined && puzzle.numericTolerance <= 0) {
    report('Numeric tolerance must be positive.');
  }
  return issues;
}

export function validateCampaign(categories: CategoryDefinition[]): ValidationIssue[] {
  const issues = categories.flatMap((category) => category.puzzles.flatMap(validatePuzzle));
  const ids = new Set<string>();
  const uniquenessKeys = new Set<string>();
  const contentFingerprints = new Set<string>();

  for (const category of categories) {
    if (category.puzzles.length < 300) {
      issues.push({
        puzzleId: category.id,
        message: 'Each category must contain at least 300 puzzles.'
      });
    }

    const levelNumbers = new Set<number>();
    for (const puzzle of category.puzzles) {
      if (puzzle.categoryId !== category.id) {
        issues.push({ puzzleId: puzzle.id, message: 'Puzzle category id does not match its category.' });
      }
      if (ids.has(puzzle.id)) {
        issues.push({ puzzleId: puzzle.id, message: 'Duplicate puzzle id.' });
      }
      ids.add(puzzle.id);

      if (uniquenessKeys.has(puzzle.uniquenessKey)) {
        issues.push({ puzzleId: puzzle.id, message: 'Duplicate puzzle rule and parameter signature.' });
      }
      uniquenessKeys.add(puzzle.uniquenessKey);

      const fingerprint = [
        puzzle.type,
        puzzle.answerMode,
        stableData(puzzle.puzzleData),
        puzzle.correctAnswers.map(String).join(','),
        puzzle.prompt
      ].join('|');
      if (contentFingerprints.has(fingerprint)) {
        issues.push({ puzzleId: puzzle.id, message: 'Duplicate puzzle content.' });
      }
      contentFingerprints.add(fingerprint);

      if (levelNumbers.has(puzzle.levelNumber)) {
        issues.push({ puzzleId: puzzle.id, message: 'Duplicate level number inside category.' });
      }
      levelNumbers.add(puzzle.levelNumber);
    }

    const tierCounts = new Map<string, number>();
    category.puzzles.forEach((puzzle) => {
      tierCounts.set(puzzle.difficultyTier, (tierCounts.get(puzzle.difficultyTier) ?? 0) + 1);
    });
    for (const tier of ['easy', 'normal', 'advanced', 'expert']) {
      if ((tierCounts.get(tier) ?? 0) < 75) {
        issues.push({
          puzzleId: category.id,
          message: `Difficulty tier ${tier} must contain at least 75 levels.`
        });
      }
    }
  }

  return issues;
}
