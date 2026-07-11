import type { PuzzleDefinition } from '../PuzzleTypes';
import { hints, diagram, ring } from './helpers';

export const chapter5: PuzzleDefinition[] = [
  diagram(
    {
      id: 'chapter-5-level-1', chapterId: 'chapter-5', levelNumber: 1, title: 'Sum Across', type: 'ring',
      prompt: 'Opposite values total 20.', difficulty: 1, answer: 13,
      explanation: 'The missing value is opposite 7, so it must be 13.',
      steps: ['2 + 18 = 20', '5 + 15 = 20', '7 + 13 = 20'],
      hints: hints('Look straight across the center.', 'Each opposite pair sums to 20.', '20 − 7 = ?')
    }, ring([2, 7, 5, 18, null, 15])
  ),
  diagram(
    {
      id: 'chapter-5-level-2', chapterId: 'chapter-5', levelNumber: 2, title: 'Four Apart', type: 'ring',
      prompt: 'Each opposite value is four greater.', difficulty: 2, answer: 12,
      explanation: 'The value opposite 8 is 8 + 4.',
      steps: ['3 ↔ 7', '5 ↔ 9', '8 ↔ 12'],
      hints: hints('Compare opposite pairs.', 'The larger side is always +4.', '8 + 4 = ?')
    }, ring([3, 5, 8, 7, 9, null])
  ),
  diagram(
    {
      id: 'chapter-5-level-3', chapterId: 'chapter-5', levelNumber: 3, title: 'Double Across', type: 'ring',
      prompt: 'The lower half doubles the upper half.', answerMode: 'multiple-choice', choices: [12, 14, 16, 18], difficulty: 2, answer: 16,
      explanation: 'The value opposite 8 is twice 8.',
      steps: ['3 × 2 = 6', '5 × 2 = 10', '8 × 2 = 16'],
      hints: hints('Opposite pairs use multiplication.', 'The lower value is double.', '8 × 2 = ?')
    }, ring([3, 5, 8, 6, 10, null])
  ),
  diagram(
    {
      id: 'chapter-5-level-4', chapterId: 'chapter-5', levelNumber: 4, title: 'Half Turn', type: 'ring',
      prompt: 'A half-turn adds 6.', difficulty: 2, answer: 11,
      explanation: 'The value opposite 5 is 5 + 6.',
      steps: ['1 + 6 = 7', '3 + 6 = 9', '5 + 6 = 11'],
      hints: hints('Rotate to the opposite position.', 'Add 6 after a half-turn.', '5 + 6 = ?')
    }, ring([1, 3, 5, 7, 9, null])
  ),
  diagram(
    {
      id: 'chapter-5-level-5', chapterId: 'chapter-5', levelNumber: 5, title: 'Ring Rhythm', type: 'ring',
      prompt: 'Continue clockwise.', difficulty: 3, answer: 13,
      explanation: 'The values increase by 2 around the ring.',
      steps: ['3, 5, 7, 9, 11, 13'],
      hints: hints('Read clockwise, not across.', 'The gap is always 2.', '11 + 2 = ?')
    }, ring([3, 5, 7, 9, 11, null])
  ),
  diagram(
    {
      id: 'chapter-5-level-6', chapterId: 'chapter-5', levelNumber: 6, title: 'Product Partners', type: 'ring',
      prompt: 'Opposite pairs multiply to 24.', answerMode: 'drag-and-drop', choices: [3, 4, 6, 8], difficulty: 3, answer: 3,
      explanation: 'The missing value is opposite 8, and 8 × 3 = 24.',
      steps: ['4 × 6 = 24', '3 × 8 = 24', '8 × 3 = 24'],
      hints: hints('Use opposite pairs.', 'Their product is always 24.', '24 ÷ 8 = ?')
    }, ring([4, 3, 8, 6, 8, null])
  ),
  diagram(
    {
      id: 'chapter-5-level-7', chapterId: 'chapter-5', levelNumber: 7, title: 'Paired Difference', type: 'ring',
      prompt: 'Opposite values differ by 9.', difficulty: 3, answer: 20,
      explanation: 'The missing value is 9 greater than 11.',
      steps: ['2 ↔ 11', '5 ↔ 14', '11 ↔ 20'],
      hints: hints('Compare numbers across the center.', 'The difference is 9.', '11 + 9 = ?')
    }, ring([2, 5, 11, 11, 14, null])
  ),
  diagram(
    {
      id: 'chapter-5-level-8', chapterId: 'chapter-5', levelNumber: 8, title: 'Square Clock', type: 'ring',
      prompt: 'Each step clockwise adds the next odd number.', difficulty: 4, answer: 37,
      explanation: 'The gaps are +3, +5, +7, +9, and +11.',
      steps: ['2 + 3 = 5', '5 + 5 = 10', '10 + 7 = 17', '17 + 9 = 26', '26 + 11 = 37'],
      hints: hints('Study the clockwise gaps.', 'The gaps are consecutive odd numbers.', 'Add 11 to 26.')
    }, ring([2, 5, 10, 17, 26, null])
  ),
  diagram(
    {
      id: 'chapter-5-level-9', chapterId: 'chapter-5', levelNumber: 9, title: 'Alternating Orbit', type: 'ring',
      prompt: 'Follow the clockwise alternating rule.', answerMode: 'multiple-choice', choices: [14, 16, 18, 20], difficulty: 4, answer: 16,
      explanation: 'Two interleaved clockwise tracks each increase by 6.',
      steps: ['Odd positions: 2, 8, 14', 'Even positions: 4, 10, 16', 'The missing even-position value is 16'],
      hints: hints('Separate alternating positions.', 'Both interleaved tracks rise by 6.', '4, 10, 16 are the even-position track.')
    }, ring([2, 4, 8, 10, 14, null])
  ),
  diagram(
    {
      id: 'chapter-5-level-10', chapterId: 'chapter-5', levelNumber: 10, title: 'Prime Orbit', type: 'ring',
      prompt: 'Complete the clockwise prime-number orbit.', difficulty: 5, answer: 17,
      explanation: 'The ring lists consecutive prime numbers.',
      steps: ['2, 3, 5, 7, 11, 13, 17', 'The next prime after 13 is 17'],
      hints: hints('These numbers have only two factors.', 'They are consecutive primes.', 'The next prime after 13 is 17.')
    }, ring([2, 3, 5, 7, 11, 13, null])
  )
];
