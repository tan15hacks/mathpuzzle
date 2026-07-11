import type { PuzzleDefinition } from '../PuzzleTypes';
import { hints, make, grid } from './helpers';

export const chapter4: PuzzleDefinition[] = [
  grid(
    {
      id: 'chapter-4-level-1', chapterId: 'chapter-4', levelNumber: 1, title: 'Row Totals', type: 'grid',
      prompt: 'Complete the last row.', difficulty: 1, answer: 14,
      explanation: 'The third value is the sum of the first two.',
      steps: ['2 + 5 = 7', '3 + 6 = 9', '4 + 10 = 14'],
      hints: hints('Read across each row.', 'Add the first two cells.', '4 + 10 = ?')
    }, [[2, 5, 7], [3, 6, 9], [4, 10, null]]
  ),
  grid(
    {
      id: 'chapter-4-level-2', chapterId: 'chapter-4', levelNumber: 2, title: 'Column Doubles', type: 'grid',
      prompt: 'Find the bottom-right cell.', answerMode: 'multiple-choice', choices: [10, 12, 14, 16], difficulty: 2, answer: 12,
      explanation: 'Each lower row doubles the row above.',
      steps: ['1, 2, 3', '2, 4, 6', '4, 8, 12'],
      hints: hints('Compare cells vertically.', 'Every row is twice the previous row.', 'Double 6.')
    }, [[1, 2, 3], [2, 4, 6], [4, 8, null]]
  ),
  grid(
    {
      id: 'chapter-4-level-3', chapterId: 'chapter-4', levelNumber: 3, title: 'Magic Center', type: 'grid',
      prompt: 'Every row totals 15. Find the center.', difficulty: 2, answer: 5,
      explanation: 'The middle row must total 15.',
      steps: ['7 + ? + 3 = 15', '? = 15 − 10', '? = 5'],
      hints: hints('Use the target row total.', 'Subtract the known cells from 15.', '15 − 7 − 3 = ?')
    }, [[8, 1, 6], [7, null, 3], [2, 9, 4]]
  ),
  grid(
    {
      id: 'chapter-4-level-4', chapterId: 'chapter-4', levelNumber: 4, title: 'Product Table', type: 'grid',
      prompt: 'Complete the multiplication grid.', answerMode: 'drag-and-drop', choices: [15, 18, 21, 24], difficulty: 2, answer: 18,
      explanation: 'Each cell in the final column is the product of the first two.',
      steps: ['2 × 4 = 8', '3 × 5 = 15', '6 × 3 = 18'],
      hints: hints('Treat each row independently.', 'Multiply the first two cells.', '6 × 3 = ?')
    }, [[2, 4, 8], [3, 5, 15], [6, 3, null]]
  ),
  grid(
    {
      id: 'chapter-4-level-5', chapterId: 'chapter-4', levelNumber: 5, title: 'Difference Rows', type: 'grid',
      prompt: 'Find the final difference.', difficulty: 3, answer: 9,
      explanation: 'The third value equals the first minus the second.',
      steps: ['12 − 7 = 5', '18 − 10 = 8', '25 − 16 = 9'],
      hints: hints('The final value is smaller.', 'Subtract the middle cell from the first.', '25 − 16 = ?')
    }, [[12, 7, 5], [18, 10, 8], [25, 16, null]]
  ),
  grid(
    {
      id: 'chapter-4-level-6', chapterId: 'chapter-4', levelNumber: 6, title: 'Diagonal Balance', type: 'grid',
      prompt: 'Both diagonals total 18. Find the missing corner.', difficulty: 3, answer: 9,
      explanation: 'The diagonal 4 + 5 + ? must total 18.',
      steps: ['4 + 5 + ? = 18', '9 + ? = 18', '? = 9'],
      hints: hints('Follow the diagonal through the center.', 'Its total must be 18.', '18 − 4 − 5 = ?')
    }, [[4, 8, 7], [6, 5, 4], [null, 2, 9]]
  ),
  make(
    {
      id: 'chapter-4-level-7', chapterId: 'chapter-4', levelNumber: 7, title: 'Four Cells', type: 'counting',
      prompt: 'How many squares are in this 2 × 2 grid?', answerMode: 'multiple-choice', choices: [4, 5, 6, 8], difficulty: 2, answer: 5,
      explanation: 'There are 4 small squares and 1 large square.',
      steps: ['Small squares: 4', 'Whole-grid square: 1', 'Total: 5'],
      hints: hints('Include the whole outline.', 'Count small and large squares.', '4 + 1 = ?')
    }, { kind: 'counting', gridSize: 2, promptShape: 'squares' }
  ),
  make(
    {
      id: 'chapter-4-level-8', chapterId: 'chapter-4', levelNumber: 8, title: 'Nine Cells', type: 'counting',
      prompt: 'Count every square in the 3 × 3 grid.', difficulty: 3, answer: 14,
      explanation: 'The grid contains 9 small, 4 medium, and 1 large square.',
      steps: ['Small: 9', 'Medium: 4', 'Large: 1', 'Total: 14'],
      hints: hints('Look for different sizes.', 'Count 1 × 1, 2 × 2, and 3 × 3 squares.', '9 + 4 + 1 = ?')
    }, { kind: 'counting', gridSize: 3, promptShape: 'squares' }
  ),
  make(
    {
      id: 'chapter-4-level-9', chapterId: 'chapter-4', levelNumber: 9, title: 'Diagonal Split', type: 'counting',
      prompt: 'Count every triangle in the crossed square.', answerMode: 'multiple-choice', choices: [4, 6, 8, 10], difficulty: 4, answer: 8,
      explanation: 'Four small triangles and four larger half-square triangles are visible.',
      steps: ['Small triangles: 4', 'Large triangles: 4', 'Total: 8'],
      hints: hints('Combine neighboring small triangles.', 'Each diagonal forms two large halves.', '4 small + 4 large.')
    }, { kind: 'counting', gridSize: 2, includeDiagonals: true, promptShape: 'triangles' }
  ),
  grid(
    {
      id: 'chapter-4-level-10', chapterId: 'chapter-4', levelNumber: 10, title: 'Dual Rule Grid', type: 'grid',
      prompt: 'Complete the final row.', difficulty: 5, answer: 32,
      explanation: 'The middle value doubles the first; the last value adds an offset that grows by one each row.',
      steps: ['4 + 8 + 0 = 12', '7 + 14 + 1 = 22', '10 + 20 + 2 = 32'],
      hints: hints('Notice the middle column first.', 'The final column is first + middle + an offset of 0, 1, then 2.', '10 + 20 + 2 = 32.')
    }, [[4, 8, 12], [7, 14, 22], [10, 20, null]]
  )
];
