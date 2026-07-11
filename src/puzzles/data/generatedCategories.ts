import type { ChapterDefinition, DifficultyBand, PuzzleDefinition } from '../PuzzleTypes';
import { diagram, equationDiagram, grid, hints, inputOutput, ring, sequence, symbolEquations, triangleGroups } from './helpers';

export const LEVELS_PER_CATEGORY = 320;
export const LEVELS_PER_DIFFICULTY = 80;
export const TOTAL_CATEGORY_COUNT = 6;
export const TOTAL_PUZZLE_COUNT = LEVELS_PER_CATEGORY * TOTAL_CATEGORY_COUNT;
export const MAX_STARS = TOTAL_PUZZLE_COUNT * 3;

export function difficultyBandForLevel(levelNumber: number): DifficultyBand {
  if (levelNumber <= 80) return 'easy';
  if (levelNumber <= 160) return 'normal';
  if (levelNumber <= 240) return 'advanced';
  return 'expert';
}

export function difficultyLabel(levelNumber: number): string {
  const band = difficultyBandForLevel(levelNumber);
  return band[0]!.toUpperCase() + band.slice(1);
}

function difficultyValue(levelNumber: number): 1 | 2 | 3 | 4 | 5 {
  const band = difficultyBandForLevel(levelNumber);
  if (band === 'easy') return 1;
  if (band === 'normal') return 2;
  if (band === 'advanced') return 4;
  return 5;
}

function puzzleId(categoryId: string, level: number): string {
  return `${categoryId}-level-${level}`;
}

function choicesFor(answer: number, seed: number): number[] {
  const values = new Set<number>([answer, answer + (seed % 7) + 2, answer - ((seed % 5) + 1), answer + ((seed % 11) + 5)]);
  while (values.size < 4) values.add(answer + values.size * 4 + seed);
  return [...values].slice(0, 4).sort((a, b) => a - b);
}

function decorate(puzzle: PuzzleDefinition, categoryId: string, family: number, params: Array<number | string>): PuzzleDefinition {
  return {
    ...puzzle,
    difficultyBand: difficultyBandForLevel(puzzle.levelNumber),
    signature: `${categoryId}:${puzzle.type}:${family}:${params.join(':')}`
  };
}

function base(categoryId: string, level: number, prefix: string, type: PuzzleDefinition['type']) {
  return {
    id: puzzleId(categoryId, level),
    chapterId: categoryId,
    levelNumber: level,
    title: `${difficultyLabel(level)} ${prefix} ${String(level).padStart(3, '0')}`,
    type,
    prompt: `Solve this ${difficultyLabel(level).toLowerCase()} ${prefix.toLowerCase()} puzzle.`,
    difficulty: difficultyValue(level)
  };
}

function sequencePuzzle(categoryId: string, level: number): PuzzleDefinition {
  const family = (level - 1) % 10;
  const start = level * 2 + family + 5;
  const step = level + family + 2;
  const bonus = Math.floor(level / 10) + 1;

  if (family === 0) {
    const values = [start, start + step, start + step * 2, start + step * 3, null];
    const answer = start + step * 4;
    return decorate(sequence({
      ...base(categoryId, level, 'Trail', 'sequence'),
      answer,
      explanation: `Each term adds ${step}.`,
      steps: [`${values[1]} - ${values[0]} = ${step}`, `The same step repeats.`, `${values[3]} + ${step} = ${answer}`],
      hints: hints('Compare neighboring terms.', `The fixed step is ${step}.`, `Add ${step} to the last shown number.`)
    }, values), categoryId, family, [step]);
  }

  if (family <= 2) {
    const multiplier = family + 1;
    const values = [1, 2, 3, 4].map((n) => n * n * multiplier + bonus);
    const answer = 25 * multiplier + bonus;
    return decorate(sequence({
      ...base(categoryId, level, 'Trail', 'sequence'),
      answer,
      explanation: `Use square numbers multiplied by ${multiplier}, then add ${bonus}.`,
      steps: [`3² × ${multiplier} + ${bonus} = ${values[2]}`, `4² × ${multiplier} + ${bonus} = ${values[3]}`, `5² × ${multiplier} + ${bonus} = ${answer}`],
      hints: hints('Look for square numbers.', `The square numbers are scaled by ${multiplier}.`, `Use 5² for the missing term.`)
    }, [...values, null]), categoryId, family, [multiplier, bonus]);
  }

  if (family <= 5) {
    const add = step;
    const sub = bonus + family;
    const values = [start, start + add, start + add - sub, start + add - sub + add, null];
    const answer = Number(values[3]) - sub;
    return decorate(sequence({
      ...base(categoryId, level, 'Trail', 'alternating-sequence'),
      answer,
      explanation: `The operations alternate: add ${add}, subtract ${sub}.`,
      steps: [`${start} + ${add} = ${values[1]}`, `${values[1]} - ${sub} = ${values[2]}`, `${values[3]} - ${sub} = ${answer}`],
      hints: hints('The rule alternates.', `Use +${add}, then -${sub}.`, `The next move is subtract ${sub}.`)
    }, values), categoryId, family, [add, sub]);
  }

  const gap = step;
  const gapRise = family + bonus;
  const second = start + gap;
  const third = second + gap + gapRise;
  const fourth = third + gap + gapRise * 2;
  const answer = fourth + gap + gapRise * 3;
  return decorate(sequence({
    ...base(categoryId, level, 'Trail', 'sequence'),
    answer,
    explanation: `The gaps increase by ${gapRise}.`,
    steps: [`First gap is ${gap}.`, `Next gaps are ${gap + gapRise} and ${gap + gapRise * 2}.`, `Add ${gap + gapRise * 3} to get ${answer}.`],
    hints: hints('Check the gaps.', `The gaps rise by ${gapRise}.`, `Use the next larger gap.`)
  }, [start, second, third, fourth, null]), categoryId, family, [gap, gapRise]);
}

function shapePuzzle(categoryId: string, level: number): PuzzleDefinition {
  const family = (level - 1) % 8;
  const a = level + 2;
  const b = (level % 11) + 3;
  const offset = Math.floor(level / 8) + 1;
  const rule = (x: number, y: number): number => {
    if (family % 4 === 0) return x + y + offset;
    if (family % 4 === 1) return x * y - offset;
    if (family % 4 === 2) return (x + y) * offset;
    return x * 2 + y * 3 + offset;
  };
  const answer = rule(a + 4, b + 2);
  const mode = level % 5 === 0 ? 'multiple-choice' : 'numeric-input';
  return decorate(diagram({
    ...base(categoryId, level, 'Shape', 'shape-code'),
    answer,
    answerMode: mode,
    choices: mode === 'multiple-choice' ? choicesFor(answer, level) : undefined,
    explanation: 'Every shape uses the same relationship between the two upper numbers and the lower number.',
    steps: [`${a} and ${b} produce ${rule(a, b)}.`, `${a + 2} and ${b + 1} produce ${rule(a + 2, b + 1)}.`, `${a + 4} and ${b + 2} produce ${answer}.`],
    hints: hints('Use the completed shapes first.', 'Both upper numbers matter.', `Apply the same rule to ${a + 4} and ${b + 2}.`)
  }, triangleGroups([[a, b, rule(a, b)], [a + 2, b + 1, rule(a + 2, b + 1)], [a + 4, b + 2, null]])), categoryId, family, [a, b, offset]);
}

function machinePuzzle(categoryId: string, level: number): PuzzleDefinition {
  const family = (level - 1) % 9;
  const x = (level % 9) + 2;
  const multiplier = (level % 7) + 2;
  const offset = Math.floor(level / 9) + 3;
  if (family === 3 || family === 7) {
    const left = level + 6;
    const right = (level % 8) + 2;
    const op = family === 3 ? '×' : '+';
    const answerValue = op === '×' ? left * right : left + right;
    return decorate(diagram({
      ...base(categoryId, level, 'Machine', 'missing-operator'),
      answer: op,
      answerMode: 'operator-selection',
      choices: ['+', '−', '×', '÷'],
      explanation: `The operator must make the equation equal ${answerValue}.`,
      steps: [`Test the operators.`, `${left} ${op} ${right} = ${answerValue}`, `The missing operator is ${op}.`],
      hints: hints('Try each operator mentally.', `The result must be ${answerValue}.`, `${op} is the only match.`)
    }, equationDiagram([`${left}  ?  ${right}  =  ${answerValue}`])), categoryId, family, [left, right, op]);
  }

  const fn = (value: number): number => family % 3 === 0 ? value * multiplier + offset : family % 3 === 1 ? (value + offset) * multiplier : value * value + offset;
  const answer = fn(x + 4);
  const mode = level % 6 === 0 ? 'multiple-choice' : 'numeric-input';
  return decorate(diagram({
    ...base(categoryId, level, 'Machine', 'input-output'),
    answer,
    answerMode: mode,
    choices: mode === 'multiple-choice' ? choicesFor(answer, level) : undefined,
    explanation: 'The same machine rule transforms every input into its output.',
    steps: [`${x} becomes ${fn(x)}.`, `${x + 2} becomes ${fn(x + 2)}.`, `${x + 4} becomes ${answer}.`],
    hints: hints('Compare the input-output pairs.', 'The same operation is repeated.', `Apply the rule to ${x + 4}.`)
  }, inputOutput([[x, fn(x)], [x + 2, fn(x + 2)], [x + 4, null]])), categoryId, family, [multiplier, offset]);
}

function gridPuzzle(categoryId: string, level: number): PuzzleDefinition {
  const family = (level - 1) % 8;
  const baseValue = level + 2;
  const offset = Math.floor(level / 8) + 2;
  const rule = (x: number, y: number): number => family % 4 === 0 ? x + y + offset : family % 4 === 1 ? x * 2 + y + offset : family % 4 === 2 ? y * 3 - x + offset : x * y - offset;
  const answer = rule(baseValue + 4, baseValue + 5);
  const mode = level % 7 === 0 ? 'multiple-choice' : 'numeric-input';
  return decorate(grid({
    ...base(categoryId, level, 'Grid', 'grid'),
    answer,
    answerMode: mode,
    choices: mode === 'multiple-choice' ? choicesFor(answer, level) : undefined,
    explanation: 'Each row creates the third cell from the first two cells.',
    steps: [`Row 1 creates ${rule(baseValue, baseValue + 1)}.`, `Row 2 creates ${rule(baseValue + 2, baseValue + 3)}.`, `Row 3 creates ${answer}.`],
    hints: hints('Read across rows.', 'The third cell depends on the first two.', `Use the row rule on ${baseValue + 4} and ${baseValue + 5}.`)
  }, [[baseValue, baseValue + 1, rule(baseValue, baseValue + 1)], [baseValue + 2, baseValue + 3, rule(baseValue + 2, baseValue + 3)], [baseValue + 4, baseValue + 5, null]]), categoryId, family, [baseValue, offset]);
}

function ringPuzzle(categoryId: string, level: number): PuzzleDefinition {
  const family = (level - 1) % 8;
  const offset = Math.floor(level / 8) + 1;
  const top = level + 3;
  const rule = (value: number): number => family % 4 === 0 ? value + offset + 4 : family % 4 === 1 ? value * 2 + offset : family % 4 === 2 ? value * 3 - offset : (value + offset) * 2;
  const answer = rule(top);
  const values = [top, top + 2, top + 4, top + 6, null, rule(top + 2), rule(top + 4), rule(top + 6)];
  const mode = level % 6 === 0 ? 'multiple-choice' : 'numeric-input';
  return decorate(diagram({
    ...base(categoryId, level, 'Ring', 'ring'),
    answer,
    answerMode: mode,
    choices: mode === 'multiple-choice' ? choicesFor(answer, level) : undefined,
    explanation: 'Each number connects to the number opposite it using the same rule.',
    steps: [`${top + 2} connects to ${rule(top + 2)}.`, `${top + 4} connects to ${rule(top + 4)}.`, `${top} connects to ${answer}.`],
    hints: hints('Compare opposite ring positions.', 'Use the same operation on each pair.', `Apply the rule to ${top}.`)
  }, ring(values)), categoryId, family, [top, offset]);
}

function mixedPuzzle(categoryId: string, level: number): PuzzleDefinition {
  const family = (level - 1) % 12;
  const a = level + 4;
  const b = (level % 12) + 3;
  const offset = Math.floor(level / 12) + 2;
  if (family % 4 === 0) {
    const star = a + offset;
    const circle = b + offset;
    const answer = star + circle;
    return decorate(diagram({
      ...base(categoryId, level, 'Vault', 'symbol-value'),
      answer,
      explanation: 'Solve each symbol value, then combine them.',
      steps: [`◆ = ${star}`, `● = ${circle}`, `◆ + ● = ${answer}`],
      hints: hints('Name each symbol value first.', 'Use the first two lines.', `Add ${star} and ${circle}.`)
    }, symbolEquations([`◆ = ${star}`, `● = ${circle}`, `◆ + ● = ?`])), categoryId, family, [star, circle]);
  }

  if (family % 4 === 1) {
    const answer = a * 2 + b + offset;
    return decorate(diagram({
      ...base(categoryId, level, 'Vault', 'balance'),
      answer,
      answerMode: 'multiple-choice',
      choices: choicesFor(answer, level),
      explanation: 'The balance adds two copies of the first value, then the other values.',
      steps: [`${a} × 2 = ${a * 2}`, `Add ${b} and ${offset}.`, `Total = ${answer}.`],
      hints: hints('Count repeated values.', 'There are two copies of the first value.', `Calculate ${a} × 2 + ${b} + ${offset}.`)
    }, equationDiagram([`${a} + ${a} + ${b} + ${offset}`, '= ?'])), categoryId, family, [a, b, offset]);
  }

  if (family % 4 === 2) {
    const answer = a * b - offset;
    return decorate(diagram({
      ...base(categoryId, level, 'Vault', 'drag-and-drop'),
      answer,
      answerMode: 'drag-and-drop',
      choices: choicesFor(answer, level),
      explanation: `The open socket needs ${a} × ${b} - ${offset}.`,
      steps: [`${a} × ${b} = ${a * b}`, `${a * b} - ${offset} = ${answer}`, `Drag ${answer} into the socket.`],
      hints: hints('Multiply first.', 'Then subtract the offset.', `Use ${a * b} - ${offset}.`)
    }, equationDiagram([`${a} × ${b} - ${offset}`, '= ?'])), categoryId, family, [a, b, offset]);
  }

  const answer = (a + b) * offset;
  return decorate(diagram({
    ...base(categoryId, level, 'Vault', 'equation'),
    answer,
    explanation: `Add the pair first, then multiply by ${offset}.`,
    steps: [`${a} + ${b} = ${a + b}`, `${a + b} × ${offset} = ${answer}`, `The answer is ${answer}.`],
    hints: hints('Use order of operations carefully.', 'The pair is grouped before multiplying.', `Calculate (${a} + ${b}) × ${offset}.`)
  }, equationDiagram([`(${a} + ${b}) × ${offset}`, '= ?'])), categoryId, family, [a, b, offset]);
}

interface CategorySpec {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  icon: string;
  accent: string;
  generator: (categoryId: string, level: number) => PuzzleDefinition;
}

const specs: CategorySpec[] = [
  { id: 'category-sequences', number: 1, title: 'Number Sequences', subtitle: 'Trails, gaps, alternating rules, and position patterns', icon: '↗', accent: '#57D3C8', generator: sequencePuzzle },
  { id: 'category-shapes', number: 2, title: 'Shape Logic', subtitle: 'Triangles, corners, and visual number codes', icon: '△', accent: '#F1C66A', generator: shapePuzzle },
  { id: 'category-machines', number: 3, title: 'Equation Machines', subtitle: 'Inputs, outputs, missing operators, and reverse rules', icon: 'ƒ', accent: '#9DA8FF', generator: machinePuzzle },
  { id: 'category-grids', number: 4, title: 'Grid Puzzles', subtitle: 'Rows, columns, and compact logic tables', icon: '▦', accent: '#62D68B', generator: gridPuzzle },
  { id: 'category-rings', number: 5, title: 'Number Rings', subtitle: 'Opposites, circles, and clock-like relationships', icon: '◉', accent: '#F09BC3', generator: ringPuzzle },
  { id: 'category-mixed', number: 6, title: 'Mixed Logic', subtitle: 'Symbols, balances, drag puzzles, and expert vaults', icon: '◇', accent: '#E89468', generator: mixedPuzzle }
];

export const categories: ChapterDefinition[] = specs.map((spec) => ({
  id: spec.id,
  number: spec.number,
  title: spec.title,
  subtitle: spec.subtitle,
  icon: spec.icon,
  accent: spec.accent,
  puzzles: Array.from({ length: LEVELS_PER_CATEGORY }, (_, index) => spec.generator(spec.id, index + 1))
}));
