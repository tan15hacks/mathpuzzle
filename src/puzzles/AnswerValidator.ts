import type { PuzzleDefinition } from './PuzzleTypes';

function normalizeText(value: string | number): string {
  return String(value).trim().replace(/×/g, '*').replace(/÷/g, '/').toLowerCase();
}

export function isCorrectAnswer(
  puzzle: PuzzleDefinition,
  submitted: string | number
): boolean {
  const normalizedSubmitted = normalizeText(submitted);
  const submittedNumber = Number(normalizedSubmitted);

  return puzzle.correctAnswers.some((answer) => {
    const normalizedAnswer = normalizeText(answer);
    const answerNumber = Number(normalizedAnswer);

    if (Number.isFinite(submittedNumber) && Number.isFinite(answerNumber)) {
      const tolerance = puzzle.numericTolerance ?? 1e-9;
      return Math.abs(submittedNumber - answerNumber) <= tolerance;
    }

    return normalizedSubmitted === normalizedAnswer;
  });
}
