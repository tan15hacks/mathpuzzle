import type { PuzzleDefinition } from '../PuzzleTypes';
import { hints, sequence } from './helpers';

export const chapter1: PuzzleDefinition[] = [
  sequence(
    {
      id: 'chapter-1-level-1', chapterId: 'chapter-1', levelNumber: 1, title: 'First Steps', type: 'sequence',
      prompt: 'Find the missing number.', difficulty: 1, answer: 14,
      explanation: 'Each number increases by 3.',
      steps: ['5 − 2 = 3', '8 − 5 = 3', '11 − 8 = 3', '11 + 3 = 14'],
      hints: hints('Compare neighboring numbers.', 'The same amount is added each time.', 'Add 3 to 11.')
    },
    [2, 5, 8, 11, null]
  ),
  sequence(
    {
      id: 'chapter-1-level-2', chapterId: 'chapter-1', levelNumber: 2, title: 'Reverse Trail', type: 'sequence',
      prompt: 'Continue the decreasing trail.', difficulty: 1, answer: 8,
      explanation: 'Each number decreases by 3.',
      steps: ['20 − 3 = 17', '17 − 3 = 14', '14 − 3 = 11', '11 − 3 = 8'],
      hints: hints('Look at how the values shrink.', 'The difference is constant.', 'Subtract 3 from 11.')
    },
    [20, 17, 14, 11, null]
  ),
  sequence(
    {
      id: 'chapter-1-level-3', chapterId: 'chapter-1', levelNumber: 3, title: 'Double Up', type: 'sequence',
      prompt: 'What comes next?', answerMode: 'multiple-choice', choices: [12, 14, 16, 18], difficulty: 1, answer: 16,
      explanation: 'Every number is twice the previous number.',
      steps: ['1 × 2 = 2', '2 × 2 = 4', '4 × 2 = 8', '8 × 2 = 16'],
      hints: hints('Compare each value with the one before it.', 'The values are multiplied.', 'Double 8.')
    },
    [1, 2, 4, 8, null]
  ),
  sequence(
    {
      id: 'chapter-1-level-4', chapterId: 'chapter-1', levelNumber: 4, title: 'Two-Step Rhythm', type: 'alternating-sequence',
      prompt: 'Follow the alternating rule.', difficulty: 2, answer: 17,
      explanation: 'The rule alternates between multiplying by 2 and subtracting 1.',
      steps: ['3 × 2 = 6', '6 − 1 = 5', '5 × 2 = 10', '10 − 1 = 9', '9 × 2 = 18', '18 − 1 = 17'],
      hints: hints('One rule is not enough.', 'The operations alternate.', 'After 18, subtract 1.')
    },
    [3, 6, 5, 10, 9, 18, null]
  ),
  sequence(
    {
      id: 'chapter-1-level-5', chapterId: 'chapter-1', levelNumber: 5, title: 'Growing Gaps', type: 'sequence',
      prompt: 'Find the next value.', difficulty: 2, answer: 30,
      explanation: 'The gaps are consecutive even numbers: +4, +6, +8, then +10.',
      steps: ['6 − 2 = 4', '12 − 6 = 6', '20 − 12 = 8', '20 + 10 = 30'],
      hints: hints('Inspect the gaps, not only the values.', 'The gaps grow by 2.', 'The next gap is 10.')
    },
    [2, 6, 12, 20, null]
  ),
  sequence(
    {
      id: 'chapter-1-level-6', chapterId: 'chapter-1', levelNumber: 6, title: 'Square Path', type: 'sequence',
      prompt: 'Complete the square-number path.', answerMode: 'drag-and-drop', choices: [20, 24, 25, 30], difficulty: 2, answer: 25,
      explanation: 'These are consecutive square numbers.',
      steps: ['1 = 1²', '4 = 2²', '9 = 3²', '16 = 4²', '25 = 5²'],
      hints: hints('Think about multiplying a number by itself.', 'The bases are 1, 2, 3, 4…', 'The next value is 5 × 5.')
    },
    [1, 4, 9, 16, null]
  ),
  sequence(
    {
      id: 'chapter-1-level-7', chapterId: 'chapter-1', levelNumber: 7, title: 'Thirds', type: 'sequence',
      prompt: 'Continue the division pattern.', difficulty: 2, answer: 1,
      explanation: 'Each value is divided by 3.',
      steps: ['81 ÷ 3 = 27', '27 ÷ 3 = 9', '9 ÷ 3 = 3', '3 ÷ 3 = 1'],
      hints: hints('The numbers shrink quickly.', 'Use the same division each time.', 'Divide 3 by 3.')
    },
    [81, 27, 9, 3, null]
  ),
  sequence(
    {
      id: 'chapter-1-level-8', chapterId: 'chapter-1', levelNumber: 8, title: 'Neighbor Sum', type: 'sequence',
      prompt: 'What number continues the trail?', difficulty: 3, answer: 21,
      explanation: 'Each number is the sum of the previous two.',
      steps: ['2 + 3 = 5', '3 + 5 = 8', '5 + 8 = 13', '8 + 13 = 21'],
      hints: hints('Look at groups of three.', 'Add two neighboring values.', 'Add 8 and 13.')
    },
    [2, 3, 5, 8, 13, null]
  ),
  sequence(
    {
      id: 'chapter-1-level-9', chapterId: 'chapter-1', levelNumber: 9, title: 'Stepping Gaps', type: 'sequence',
      prompt: 'Find the missing number.', difficulty: 4, answer: 50,
      explanation: 'The gaps increase by 3: +3, +6, +9, +12, +15.',
      steps: ['8 − 5 = 3', '14 − 8 = 6', '23 − 14 = 9', '35 − 23 = 12', '35 + 15 = 50'],
      hints: hints('Calculate every gap.', 'The gaps form another sequence.', 'The next gap is 15.')
    },
    [5, 8, 14, 23, 35, null]
  ),
  sequence(
    {
      id: 'chapter-1-level-10', chapterId: 'chapter-1', levelNumber: 10, title: 'Factorial Gate', type: 'sequence',
      prompt: 'Open the final trail gate.', answerMode: 'multiple-choice', choices: [96, 100, 110, 120], difficulty: 5, answer: 120,
      explanation: 'Multiply by the next counting number each time.',
      steps: ['1 × 2 = 2', '2 × 3 = 6', '6 × 4 = 24', '24 × 5 = 120'],
      hints: hints('The multiplier changes each step.', 'The multipliers are 2, 3, 4, 5.', 'Multiply 24 by 5.')
    },
    [1, 2, 6, 24, null]
  )
];
