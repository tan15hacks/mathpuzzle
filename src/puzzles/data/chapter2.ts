import type { PuzzleDefinition } from '../PuzzleTypes';
import { hints, make, grid, diagram, triangleGroups, ring, symbolEquations } from './helpers';

export const chapter2: PuzzleDefinition[] = [
  diagram(
    {
      id: 'chapter-2-level-1', chapterId: 'chapter-2', levelNumber: 1, title: 'Triangle Sum', type: 'triangle',
      prompt: 'Find the number below the third triangle.', difficulty: 1, answer: 15,
      explanation: 'The bottom value is the sum of the two top values.',
      steps: ['3 + 5 = 8', '4 + 7 = 11', '6 + 9 = 15'],
      hints: hints('Compare the top pair with the bottom.', 'The two top values are added.', 'Add 6 and 9.')
    }, triangleGroups([[3, 5, 8], [4, 7, 11], [6, 9, null]])
  ),
  diagram(
    {
      id: 'chapter-2-level-2', chapterId: 'chapter-2', levelNumber: 2, title: 'Triangle Difference', type: 'triangle',
      prompt: 'Complete the final triangle.', difficulty: 1, answer: 7,
      explanation: 'The bottom value is left minus right.',
      steps: ['9 − 4 = 5', '12 − 7 = 5', '18 − 11 = 7'],
      hints: hints('The bottom value is smaller than both top values.', 'Subtract the right value from the left.', 'Calculate 18 − 11.')
    }, triangleGroups([[9, 4, 5], [12, 7, 5], [18, 11, null]])
  ),
  grid(
    {
      id: 'chapter-2-level-3', chapterId: 'chapter-2', levelNumber: 3, title: 'Corner Product', type: 'shape-code',
      prompt: 'Complete the third row.', answerMode: 'multiple-choice', choices: [36, 40, 42, 48], difficulty: 2, answer: 42,
      explanation: 'The third value in each row is the product of the first two.',
      steps: ['2 × 3 = 6', '4 × 5 = 20', '6 × 7 = 42'],
      hints: hints('Read each row separately.', 'The row uses multiplication.', 'Multiply 6 by 7.')
    }, [[2, 3, 6], [4, 5, 20], [6, 7, null]]
  ),
  diagram(
    {
      id: 'chapter-2-level-4', chapterId: 'chapter-2', levelNumber: 4, title: 'Opposite Circle', type: 'shape-code',
      prompt: 'Every opposite pair totals the same value.', difficulty: 2, answer: 13,
      explanation: 'Opposite values add to 20.',
      steps: ['2 + 18 = 20', '7 + 13 = 20', '15 + 5 = 20'],
      hints: hints('Compare values directly across the center.', 'Opposite pairs share the same sum.', '20 − 7 = 13.')
    }, ring([2, 7, 15, 18, null, 5])
  ),
  diagram(
    {
      id: 'chapter-2-level-5', chapterId: 'chapter-2', levelNumber: 5, title: 'Middle Point', type: 'triangle',
      prompt: 'Find the average of the top pair.', difficulty: 2, answer: 19,
      explanation: 'The bottom value is halfway between the two top values.',
      steps: ['(4 + 8) ÷ 2 = 6', '(10 + 14) ÷ 2 = 12', '(16 + 22) ÷ 2 = 19'],
      hints: hints('The bottom lies between the top values.', 'Use the average of the top pair.', 'Add 16 and 22, then divide by 2.')
    }, triangleGroups([[4, 8, 6], [10, 14, 12], [16, 22, null]])
  ),
  grid(
    {
      id: 'chapter-2-level-6', chapterId: 'chapter-2', levelNumber: 6, title: 'Row Builder', type: 'shape-code',
      prompt: 'Find the missing center value.', answerMode: 'drag-and-drop', choices: [5, 6, 7, 8], difficulty: 3, answer: 6,
      explanation: 'In each row, the third value equals the first plus the second.',
      steps: ['2 + 4 = 6', '3 + 6 = 9', '5 + 10 = 15'],
      hints: hints('Treat each horizontal row as one shape.', 'The right value is a sum.', '9 − 3 = 6.')
    }, [[2, 4, 6], [3, null, 9], [5, 10, 15]]
  ),
  diagram(
    {
      id: 'chapter-2-level-7', chapterId: 'chapter-2', levelNumber: 7, title: 'Sides Speak', type: 'symbol-value',
      prompt: 'Use the number of sides represented by each shape.', answerMode: 'multiple-choice', choices: [12, 13, 14, 15], difficulty: 3, answer: 15,
      explanation: 'Triangle = 3, square = 4, and pentagon = 5.',
      steps: ['Triangle has 3 sides', 'Square has 4 sides', 'Pentagon has 5 sides', '3 + 3 + 4 + 5 = 15'],
      hints: hints('The shapes already contain their values.', 'Count the straight sides.', '3 + 3 + 4 + 5 = ?')
    }, symbolEquations(['△ = 3', '□ = 4', '⬠ = 5', '△ + △ + □ + ⬠ = ?'])
  ),
  diagram(
    {
      id: 'chapter-2-level-8', chapterId: 'chapter-2', levelNumber: 8, title: 'Product Triangle', type: 'drag-and-drop',
      prompt: 'Drag the missing product into place.', answerMode: 'drag-and-drop', choices: [24, 28, 32, 36], difficulty: 3, answer: 32,
      explanation: 'The bottom value is the product of the top pair.',
      steps: ['3 × 4 = 12', '5 × 6 = 30', '4 × 8 = 32'],
      hints: hints('The result grows faster than a sum.', 'Multiply the two top values.', '4 × 8 = ?')
    }, triangleGroups([[3, 4, 12], [5, 6, 30], [4, 8, null]])
  ),
  make(
    {
      id: 'chapter-2-level-9', chapterId: 'chapter-2', levelNumber: 9, title: 'Square Census', type: 'counting',
      prompt: 'How many squares are visible in the 3 × 3 grid?', answerMode: 'multiple-choice', choices: [9, 12, 14, 16], difficulty: 4, answer: 14,
      explanation: 'Count 9 small squares, 4 medium squares, and 1 large square.',
      steps: ['1 × 1 squares: 9', '2 × 2 squares: 4', '3 × 3 squares: 1', '9 + 4 + 1 = 14'],
      hints: hints('Do not count only the smallest cells.', 'Include 2 × 2 groups and the whole grid.', '9 + 4 + 1 = ?')
    }, { kind: 'counting', gridSize: 3, promptShape: 'squares' }
  ),
  make(
    {
      id: 'chapter-2-level-10', chapterId: 'chapter-2', levelNumber: 10, title: 'Crossed Window', type: 'counting',
      prompt: 'How many triangles are formed?', difficulty: 5, answer: 8,
      explanation: 'The two diagonals divide the square into 4 small triangles; combining neighboring pairs creates 4 larger triangles.',
      steps: ['Small triangles: 4', 'Larger half-square triangles: 4', 'Total: 4 + 4 = 8'],
      hints: hints('Count small and combined shapes.', 'Each diagonal creates larger halves.', 'There are 4 small and 4 large triangles.')
    }, { kind: 'counting', gridSize: 2, includeDiagonals: true, promptShape: 'triangles' }
  )
];
