import type { PuzzleDefinition } from '../PuzzleTypes';
import { hints, diagram, equationDiagram, inputOutput, symbolEquations } from './helpers';

export const chapter3: PuzzleDefinition[] = [
  diagram(
    {
      id: 'chapter-3-level-1', chapterId: 'chapter-3', levelNumber: 1, title: 'Twin Equations', type: 'equation',
      prompt: 'Find A ÷ B.', difficulty: 2, answer: 2,
      explanation: 'Adding the equations gives A = 12, then B = 6.',
      steps: ['A + B = 18', 'A − B = 6', '2A = 24, so A = 12', 'B = 6', 'A ÷ B = 2'],
      hints: hints('Combine both equations.', 'Add them to eliminate B.', 'A = 12 and B = 6.')
    }, equationDiagram(['A + B = 18', 'A − B = 6', 'A ÷ B = ?'])
  ),
  diagram(
    {
      id: 'chapter-3-level-2', chapterId: 'chapter-3', levelNumber: 2, title: 'Triple Machine', type: 'input-output',
      prompt: 'Find the final output.', difficulty: 1, answer: 19,
      explanation: 'Multiply the input by 3, then add 1.',
      steps: ['2 × 3 + 1 = 7', '4 × 3 + 1 = 13', '6 × 3 + 1 = 19'],
      hints: hints('Compare each input with its output.', 'Multiply first, then add.', '6 × 3 + 1 = ?')
    }, inputOutput([[2, 7], [4, 13], [6, null]])
  ),
  diagram(
    {
      id: 'chapter-3-level-3', chapterId: 'chapter-3', levelNumber: 3, title: 'Square Minus One', type: 'input-output',
      prompt: 'Complete the machine.', answerMode: 'multiple-choice', choices: [42, 46, 48, 50], difficulty: 3, answer: 48,
      explanation: 'Square the input, then subtract 1.',
      steps: ['3² − 1 = 8', '5² − 1 = 24', '7² − 1 = 48'],
      hints: hints('The output is near a square number.', 'Square the input, then subtract 1.', '7² is 49.')
    }, inputOutput([[3, 8], [5, 24], [7, null]])
  ),
  diagram(
    {
      id: 'chapter-3-level-4', chapterId: 'chapter-3', levelNumber: 4, title: 'Operator Lock', type: 'missing-operator',
      prompt: 'Select the missing operator.', answerMode: 'operator-selection', choices: ['+', '−', '×', '÷'], difficulty: 1, answer: '×',
      explanation: 'Eight multiplied by four equals thirty-two.',
      steps: ['Test multiplication', '8 × 4 = 32'],
      hints: hints('The result is larger than both numbers.', 'Use multiplication.', '8 × 4 = 32.')
    }, equationDiagram(['8  ?  4 = 32'])
  ),
  diagram(
    {
      id: 'chapter-3-level-5', chapterId: 'chapter-3', levelNumber: 5, title: 'Division Lock', type: 'missing-operator',
      prompt: 'Select the missing operator.', answerMode: 'operator-selection', choices: ['+', '−', '×', '÷'], difficulty: 1, answer: '÷',
      explanation: 'Eighteen divided by three equals six.',
      steps: ['Test division', '18 ÷ 3 = 6'],
      hints: hints('The result is smaller than 18.', 'Use division.', '18 ÷ 3 = 6.')
    }, equationDiagram(['18  ?  3 = 6'])
  ),
  diagram(
    {
      id: 'chapter-3-level-6', chapterId: 'chapter-3', levelNumber: 6, title: 'Shape Algebra', type: 'symbol-value',
      prompt: 'Find the value of the circle.', difficulty: 3, answer: 4,
      explanation: 'Two triangles total 12, so each triangle is 6. A triangle plus a circle equals 10, so the circle is 4.',
      steps: ['△ + △ = 12', '△ = 6', '△ + ○ = 10', '○ = 4'],
      hints: hints('Solve the first line first.', 'Each triangle equals 6.', '10 − 6 = ?')
    }, symbolEquations(['△ + △ = 12', '△ + ○ = 10', '○ = ?'])
  ),
  diagram(
    {
      id: 'chapter-3-level-7', chapterId: 'chapter-3', levelNumber: 7, title: 'Reverse Machine', type: 'equation',
      prompt: 'Which input opens the machine?', answerMode: 'drag-and-drop', choices: [6, 7, 8, 9], difficulty: 3, answer: 7,
      explanation: 'Reverse the operations: add 3 to 25, then divide by 4.',
      steps: ['x × 4 − 3 = 25', 'x × 4 = 28', 'x = 7'],
      hints: hints('Undo the final operation first.', 'Add 3, then divide by 4.', '(25 + 3) ÷ 4 = ?')
    }, equationDiagram(['? × 4 − 3 = 25'])
  ),
  diagram(
    {
      id: 'chapter-3-level-8', chapterId: 'chapter-3', levelNumber: 8, title: 'Threefold Plus', type: 'input-output',
      prompt: 'Find the final output.', difficulty: 3, answer: 30,
      explanation: 'Multiply each input by 3, then add 3.',
      steps: ['5 × 3 + 3 = 18', '7 × 3 + 3 = 24', '9 × 3 + 3 = 30'],
      hints: hints('The outputs rise by 6 as inputs rise by 2.', 'Use three times the input plus 3.', '9 × 3 + 3 = ?')
    }, inputOutput([[5, 18], [7, 24], [9, null]])
  ),
  diagram(
    {
      id: 'chapter-3-level-9', chapterId: 'chapter-3', levelNumber: 9, title: 'Order Matters', type: 'multiple-choice',
      prompt: 'Evaluate using standard order of operations.', answerMode: 'multiple-choice', choices: [14, 20, 24, 32], difficulty: 3, answer: 14,
      explanation: 'Multiplication happens before addition.',
      steps: ['3 × 4 = 12', '2 + 12 = 14'],
      hints: hints('Do not always work left to right.', 'Multiplication comes first.', 'Calculate 3 × 4 before adding 2.')
    }, equationDiagram(['2 + 3 × 4 = ?'])
  ),
  diagram(
    {
      id: 'chapter-3-level-10', chapterId: 'chapter-3', levelNumber: 10, title: 'Ratio Vault', type: 'equation',
      prompt: 'Find A − B.', difficulty: 5, answer: 12,
      explanation: 'A is three times B. Four equal B-parts total 24, so B = 6 and A = 18.',
      steps: ['A = 3B', 'A + B = 24', '4B = 24', 'B = 6 and A = 18', 'A − B = 12'],
      hints: hints('Replace A with 3B.', 'Then 3B + B = 24.', 'B = 6 and A = 18.')
    }, equationDiagram(['A = 3B', 'A + B = 24', 'A − B = ?'])
  )
];
