import type { PuzzleDefinition } from '../PuzzleTypes';
import { hints, sequence, grid, diagram, equationDiagram, triangleGroups, symbolEquations } from './helpers';

export const chapter6: PuzzleDefinition[] = [
  diagram(
    {
      id: 'chapter-6-level-1', chapterId: 'chapter-6', levelNumber: 1, title: 'Symbol Chain', type: 'symbol-value',
      prompt: 'Find star + circle.', difficulty: 3, answer: 9,
      explanation: 'Two stars total 10, so a star is 5. Star plus circle equals 9.',
      steps: ['★ + ★ = 10', '★ = 5', '★ + ○ = 9', '5 + 4 = 9'],
      hints: hints('Solve the first equation.', 'A star is 5.', 'The circle is 4, so add 5 + 4.')
    }, symbolEquations(['★ + ★ = 10', '★ + ○ = 9', '★ + ○ = ?'])
  ),
  diagram(
    {
      id: 'chapter-6-level-2', chapterId: 'chapter-6', levelNumber: 2, title: 'Balanced Sides', type: 'balance',
      prompt: 'What value balances the scale?', answerMode: 'multiple-choice', choices: [4, 5, 6, 7], difficulty: 3, answer: 6,
      explanation: 'Three identical blocks total 18, so each block is 6.',
      steps: ['■ + ■ + ■ = 18', '3■ = 18', '■ = 6'],
      hints: hints('All blocks have equal weight.', 'Divide the total by the number of blocks.', '18 ÷ 3 = ?')
    }, symbolEquations(['■ + ■ + ■ = 18', '■ = ?'])
  ),
  sequence(
    {
      id: 'chapter-6-level-3', chapterId: 'chapter-6', levelNumber: 3, title: 'Split Sequence', type: 'alternating-sequence',
      prompt: 'Find the final value.', difficulty: 4, answer: 18,
      explanation: 'Odd positions are 2, 6, 10, 14, 18; even positions are 9, 8, 7, 6.',
      steps: ['Odd track: +4', 'Even track: −1', 'The next odd-track value after 14 is 18'],
      hints: hints('Separate odd and even positions.', 'One track rises by 4.', '14 + 4 = ?')
    }, [2, 9, 6, 8, 10, 7, 14, 6, null]
  ),
  grid(
    {
      id: 'chapter-6-level-4', chapterId: 'chapter-6', levelNumber: 4, title: 'Grid Vault', type: 'grid',
      prompt: 'Find the bottom-right value.', difficulty: 4, answer: 27,
      explanation: 'Each row multiplies the first two values and then adds the row number.',
      steps: ['2 × 3 + 1 = 7', '3 × 4 + 2 = 14', '4 × 6 + 3 = 27'],
      hints: hints('Each row uses multiplication and a small offset.', 'The offset matches the row number.', '4 × 6 + 3 = ?')
    }, [[2, 3, 7], [3, 4, 14], [4, 6, null]]
  ),
  diagram(
    {
      id: 'chapter-6-level-5', chapterId: 'chapter-6', levelNumber: 5, title: 'Operator Pair', type: 'missing-operator',
      prompt: 'Select the operator that makes both lines true.', answerMode: 'operator-selection', choices: ['+', '−', '×', '÷'], difficulty: 4, answer: '−',
      explanation: 'Subtraction works in both equations.',
      steps: ['14 − 5 = 9', '20 − 8 = 12'],
      hints: hints('Test the same operator in both lines.', 'The results are smaller than the first values.', '14 − 5 = 9.')
    }, equationDiagram(['14 ? 5 = 9', '20 ? 8 = 12'])
  ),
  diagram(
    {
      id: 'chapter-6-level-6', chapterId: 'chapter-6', levelNumber: 6, title: 'Drop the Key', type: 'drag-and-drop',
      prompt: 'Drag the value that completes the machine.', answerMode: 'drag-and-drop', choices: [8, 9, 10, 11], difficulty: 4, answer: 9,
      explanation: 'The machine squares the input and subtracts 5.',
      steps: ['x² − 5 = 76', 'x² = 81', 'x = 9'],
      hints: hints('Undo the subtraction first.', 'The required square is 81.', 'Which positive number squared is 81?')
    }, equationDiagram(['?² − 5 = 76'])
  ),
  diagram(
    {
      id: 'chapter-6-level-7', chapterId: 'chapter-6', levelNumber: 7, title: 'Triangle Vault', type: 'triangle',
      prompt: 'Complete the final triangle.', difficulty: 4, answer: 23,
      explanation: 'Multiply the top values, then subtract their sum.',
      steps: ['3 × 4 − (3 + 4) = 5', '5 × 6 − (5 + 6) = 19', '4 × 9 − (4 + 9) = 23'],
      hints: hints('Use both multiplication and addition.', 'Product minus sum.', '4 × 9 − 13 = 23.')
    }, triangleGroups([[3, 4, 5], [5, 6, 19], [4, 9, null]])
  ),
  diagram(
    {
      id: 'chapter-6-level-8', chapterId: 'chapter-6', levelNumber: 8, title: 'Three Variables', type: 'equation',
      prompt: 'Find A + B + C.', difficulty: 4, answer: 18,
      explanation: 'A is 4, B is 6, and C is 8.',
      steps: ['A + B = 10', 'B + C = 14', 'A + C = 12', 'Add all equations: 2(A+B+C)=36', 'A+B+C=18'],
      hints: hints('Add all three equations.', 'Every variable appears twice.', 'Divide the combined total 36 by 2.')
    }, equationDiagram(['A + B = 10', 'B + C = 14', 'A + C = 12', 'A + B + C = ?'])
  ),
  diagram(
    {
      id: 'chapter-6-level-9', chapterId: 'chapter-6', levelNumber: 9, title: 'Nested Order', type: 'multiple-choice',
      prompt: 'Evaluate the expression.', answerMode: 'multiple-choice', choices: [18, 22, 26, 30], difficulty: 4, answer: 26,
      explanation: 'Work inside parentheses first, then multiply, then add.',
      steps: ['5 − 2 = 3', '3 × 6 = 18', '8 + 18 = 26'],
      hints: hints('Start inside parentheses.', 'Then multiply before adding.', '8 + (3 × 6) = ?')
    }, equationDiagram(['8 + (5 − 2) × 6 = ?'])
  ),
  diagram(
    {
      id: 'chapter-6-level-10', chapterId: 'chapter-6', levelNumber: 10, title: 'Nexus Core', type: 'equation',
      prompt: 'Find the final value of N.', difficulty: 5, answer: 42,
      explanation: 'The sequence of transformations is applied in order: double 9, add 5, then add the previous prime 19.',
      steps: ['9 × 2 = 18', '18 + 5 = 23', '23 + 19 = 42'],
      hints: hints('Follow the arrows in order.', 'The last added value is the prime before 23.', '23 + 19 = ?')
    }, equationDiagram(['9  → ×2 → 18', '18 → +5 → 23', '23 → +19 → N', 'N = ?'])
  )
];
