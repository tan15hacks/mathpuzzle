import type { ChapterDefinition, DifficultyBand, PuzzleDefinition } from '../PuzzleTypes';
import { diagram, equationDiagram, grid, hints, inputOutput, make, ring, sequence, symbolEquations, triangleGroups } from './helpers';

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

function id(categoryId: string, level: number): string {
  return `${categoryId}-level-${level}`;
}

function title(prefix: string, level: number): string {
  return `${difficultyLabel(level)} ${prefix} ${String(level).padStart(3, '0')}`;
}

function choicesFor(answer: number, seed: number): number[] {
  const raw = [answer, answer + (seed % 7) + 2, answer - ((seed % 5) + 1), answer + ((seed % 11) + 5)];
  const unique = [...new Set(raw)].filter((value) => Number.isFinite(value));
  while (unique.length < 4) unique.push(answer + unique.length * 3 + seed + 1);
  return unique.slice(0, 4).sort((a, b) => a - b);
}

function decorate(puzzle: PuzzleDefinition, signature: string): PuzzleDefinition {
  return {
    ...puzzle,
    difficultyBand: difficultyBandForLevel(puzzle.levelNumber),
    signature
  };
}

function sequenceCategory(categoryId: string): PuzzleDefinition[] {
  return Array.from({ length: LEVELS_PER_CATEGORY }, (_, index) => {
    const level = index + 1;
    const family = index % 16;
    const band = difficultyBandForLevel(level);
    const d = difficultyValue(level);
    const seed = level + 3;
    const common = {
      id: id(categoryId, level),
      chapterId: categoryId,
      levelNumber: level,
      title: title('Trail', level),
      type: family % 2 === 0 ? ('sequence' as const) : ('alternating-sequence' as const),
      prompt: `Find the missing number in this ${band} sequence.`,
      difficulty: d
    };

    if (family === 0) {
      const step = level + 2;
      const start = seed * 2;
      const values = [start, start + step, start + step * 2, start + step * 3, null];
      const answer = start + step * 4;
      return decorate(sequence({
        ...common,
        answer,
        explanation: `Each term adds ${step}.`,
        steps: [`${values[1]} - ${values[0]} = ${step}`, `The same step repeats.`, `${values[3]} + ${step} = ${answer}`],
        hints: hints('Compare neighboring terms.', `The fixed step is ${step}.`, `Add ${step} to ${values[3]}.`)
      }, values), `${categoryId}:arithmetic-step:${step}`);
    }

    if (family === 1) {
      const multiplier = 2 + (level % 4);
      const offset = Math.floor(level / 16) + 1;
      const a = (level % 9) + 2;
      const values = [a, a * multiplier + offset, (a * multiplier + offset) * multiplier + offset, null];
      const answer = Number(values[2]) * multiplier + offset;
      return decorate(sequence({
        ...common,
        answer,
        explanation: `Multiply by ${multiplier}, then add ${offset}.`,
        steps: [`${a} × ${multiplier} + ${offset} = ${values[1]}`, `${values[1]} × ${multiplier} + ${offset} = ${values[2]}`, `${values[2]} × ${multiplier} + ${offset} = ${answer}`],
        hints: hints('The sequence grows faster than simple addition.', `Use ×${multiplier}, then +${offset}.`, `Apply the same rule to ${values[2]}.`)
      }, values), `${categoryId}:multiply-offset:${multiplier}:${offset}`);
    }

    if (family === 2) {
      const offset = level + 1;
      const values = [1, 2, 3, 4].map((n) => n * n + offset);
      const answer = 25 + offset;
      return decorate(sequence({
        ...common,
        answer,
        explanation: `The numbers are square numbers plus ${offset}.`,
        steps: [`1² + ${offset} = ${values[0]}`, `4² + ${offset} = ${values[3]}`, `5² + ${offset} = ${answer}`],
        hints: hints('Look for square numbers hidden under the values.', `Subtract ${offset} from each term.`, `Use 5² + ${offset}.`)
      }, [...values, null]), `${categoryId}:square-offset:${offset}`);
    }

    if (family === 3) {
      const offset = level + 4;
      const tri = (n: number): number => (n * (n + 1)) / 2 + offset;
      const values = [tri(2), tri(3), tri(4), tri(5), null];
      const answer = tri(6);
      return decorate(sequence({
        ...common,
        answer,
        explanation: `Each term follows triangular numbers plus ${offset}.`,
        steps: [`T₂ + ${offset} = ${values[0]}`, `T₅ + ${offset} = ${values[3]}`, `T₆ + ${offset} = ${answer}`],
        hints: hints('The gaps increase by one each time.', 'Think of triangular numbers.', `The next base value is 21, then add ${offset}.`)
      }, values), `${categoryId}:triangular-offset:${offset}`);
    }

    if (family === 4) {
      const add = level + 5;
      const sub = (level % 9) + 2;
      const start = level * 2 + 10;
      const values = [start, start + add, start + add - sub, start + add - sub + add, null];
      const answer = Number(values[3]) - sub;
      return decorate(sequence({
        ...common,
        answer,
        explanation: `The operations alternate: add ${add}, subtract ${sub}.`,
        steps: [`${start} + ${add} = ${values[1]}`, `${values[1]} - ${sub} = ${values[2]}`, `${values[3]} - ${sub} = ${answer}`],
        hints: hints('The sequence alternates two operations.', `Use +${add}, then -${sub}.`, `After ${values[3]}, subtract ${sub}.`)
      }, values), `${categoryId}:alternate-add-sub:${add}:${sub}`);
    }

    if (family === 5) {
      const stepA = level + 3;
      const stepB = level + 7;
      const a = 4 + level;
      const b = 9 + level * 2;
      const values = [a, b, a + stepA, b + stepB, a + stepA * 2, null];
      const answer = b + stepB * 2;
      return decorate(sequence({
        ...common,
        answer,
        explanation: `Odd and even positions are two separate sequences.`,
        steps: [`Odd positions add ${stepA}.`, `Even positions add ${stepB}.`, `${values[3]} + ${stepB} = ${answer}`],
        hints: hints('Split the terms by position.', 'Check positions 2, 4, and 6.', `The even-position step is ${stepB}.`)
      }, values), `${categoryId}:interleaved:${stepA}:${stepB}`);
    }

    if (family === 6) {
      const bonus = level + 1;
      const a = (level % 6) + 2;
      const b = (level % 8) + 5;
      const c = a + b + bonus;
      const d2 = b + c + bonus;
      const values = [a, b, c, d2, null];
      const answer = c + d2 + bonus;
      return decorate(sequence({
        ...common,
        answer,
        explanation: `Add the previous two numbers, then add ${bonus}.`,
        steps: [`${a} + ${b} + ${bonus} = ${c}`, `${b} + ${c} + ${bonus} = ${d2}`, `${c} + ${d2} + ${bonus} = ${answer}`],
        hints: hints('Use the two previous terms together.', `Add ${bonus} after combining them.`, `Use ${c} + ${d2} + ${bonus}.`)
      }, values), `${categoryId}:fib-bonus:${bonus}`);
    }

    if (family === 7) {
      const factor = level + 1;
      const offset = (level % 13) + 3;
      const values = [1, 2, 3, 4].map((n) => n * factor + offset);
      const answer = 5 * factor + offset;
      return decorate(sequence({
        ...common,
        answer,
        explanation: `Term n equals n × ${factor} + ${offset}.`,
        steps: [`3 × ${factor} + ${offset} = ${values[2]}`, `4 × ${factor} + ${offset} = ${values[3]}`, `5 × ${factor} + ${offset} = ${answer}`],
        hints: hints('Use the position number.', `Multiply the position by ${factor}.`, `Use position 5.`)
      }, [...values, null]), `${categoryId}:position-linear:${factor}:${offset}`);
    }

    if (family === 8) {
      const base = 2 + (level % 3);
      const offset = level + 6;
      const values = [1, 2, 3, 4].map((n) => base ** n + offset);
      const answer = base ** 5 + offset;
      return decorate(sequence({
        ...common,
        answer,
        explanation: `Use powers of ${base}, then add ${offset}.`,
        steps: [`${base}³ + ${offset} = ${values[2]}`, `${base}⁴ + ${offset} = ${values[3]}`, `${base}⁵ + ${offset} = ${answer}`],
        hints: hints('The hidden base is repeatedly multiplied.', `Use powers of ${base}.`, `Calculate ${base}⁵ + ${offset}.`)
      }, [...values, null]), `${categoryId}:powers:${base}:${offset}`);
    }

    const firstGap = level + family;
    const gapStep = (level % 7) + family;
    const start = 10 + level;
    const second = start + firstGap;
    const third = second + firstGap + gapStep;
    const fourth = third + firstGap + gapStep * 2;
    const answer = fourth + firstGap + gapStep * 3;
    return decorate(sequence({
      ...common,
      answer,
      explanation: `The gaps grow by ${gapStep}.`,
      steps: [`First gap: ${firstGap}`, `Next gaps: ${firstGap + gapStep}, ${firstGap + gapStep * 2}`, `Next gap: ${firstGap + gapStep * 3}, so answer is ${answer}`],
      hints: hints('Look at the gaps between terms.', `The gaps increase by ${gapStep}.`, `Add ${firstGap + gapStep * 3} to ${fourth}.`)
    }, [start, second, third, fourth, null]), `${categoryId}:growing-gap:${firstGap}:${gapStep}`);
  });
}

function shapeCategory(categoryId: string): PuzzleDefinition[] {
  return Array.from({ length: LEVELS_PER_CATEGORY }, (_, index) => {
    const level = index + 1;
    const family = index % 8;
    const d = difficultyValue(level);
    const a = level + 2;
    const b = (level % 11) + 3;
    const offset = Math.floor(level / 8) + 1;
    const common = {
      id: id(categoryId, level),
      chapterId: categoryId,
      levelNumber: level,
      title: title('Shape', level),
      type: 'shape-code' as const,
      prompt: 'Find the missing value in the visual code.',
      difficulty: d
    };

    const rule = (x: number, y: number): number => {
      if (family === 0) return x + y + offset;
      if (family === 1) return x * y - offset;
      if (family === 2) return (x + y) * offset;
      if (family === 3) return Math.abs(x - y) * (offset + 2);
      if (family === 4) return x * 2 + y * 3 + offset;
      if (family === 5) return x * x + y + offset;
      if (family === 6) return y * y - x + offset;
      return (x + offset) * (y - 1);
    };
    const g1: [number, number, number] = [a, b, rule(a, b)];
    const g2: [number, number, number] = [a + 2, b + 1, rule(a + 2, b + 1)];
    const answer = rule(a + 4, b + 2);

    return decorate(diagram({
      ...common,
      answer,
      explanation: `Each shape applies rule ${family + 1}: use the two top numbers to create the lower number.`,
      steps: [`First example gives ${g1[2]}.`, `Second example gives ${g2[2]}.`, `Apply the same rule to ${a + 4} and ${b + 2}: ${answer}.`],
      hints: hints('Compare the two completed shapes first.', 'Use both top numbers, not only one.', `The final shape uses ${a + 4} and ${b + 2}.`),
      answerMode: level % 5 === 0 ? 'multiple-choice' : 'numeric-input',
      choices: level % 5 === 0 ? choicesFor(answer, level) : undefined
    }, triangleGroups([g1, g2, [a + 4, b + 2, null]])), `${categoryId}:shape-family:${family}:offset:${offset}`);
  });
}

function equationCategory(categoryId: string): PuzzleDefinition[] {
  return Array.from({ length: LEVELS_PER_CATEGORY }, (_, index) => {
    const level = index + 1;
    const family = index % 10;
    const d = difficultyValue(level);
    const x = (level % 9) + 2;
    const multiplier = (level % 7) + 2;
    const offset = Math.floor(level / 10) + 3;
    const common = {
      id: id(categoryId, level),
      chapterId: categoryId,
      levelNumber: level,
      title: title('Machine', level),
      prompt: 'Decode the machine output.',
      difficulty: d
    };

    if (family === 3 || family === 7) {
      const left = level + 6;
      const right = (level % 8) + 2;
      const op = family === 3 ? '×' : '+';
      const answerValue = op === '×' ? left * right : left + right;
      return decorate(diagram({
        ...common,
        type: 'missing-operator' as const,
        answerMode: 'operator-selection',
        answer: op,
        choices: ['+', '−', '×', '÷'],
        explanation: `The operator must make the equation equal ${answerValue}.`,
        steps: [`Test the available operators.`, `${left} ${op} ${right} = ${answerValue}`, `So the missing operator is ${op}.`],
        hints: hints('Try each operator mentally.', `The result should be ${answerValue}.`, `${left} ${op} ${right} works exactly.`)
      }, equationDiagram([`${left}  ?  ${right}  =  ${answerValue}`])), `${categoryId}:operator:${op}:${left}:${right}`);
    }

    const fn = (value: number): number => {
      if (family === 0) return value * multiplier + offset;
      if (family === 1) return (value + offset) * multiplier;
      if (family === 2) return value * value + offset;
      if (family === 4) return value * multiplier - offset;
      if (family === 5) return (value - 1) * (multiplier + offset);
      if (family === 6) return value * 3 + multiplier * offset;
      if (family === 8) return value * value - multiplier + offset;
      return value * (multiplier + 1) + offset * 2;
    };
    const pairs: Array<[number, number | null]> = [[x, fn(x)], [x + 2, fn(x + 2)], [x + 4, null]];
    const answer = fn(x + 4);

    return decorate(diagram({
      ...common,
      type: 'input-output' as const,
      answer,
      answerMode: level % 6 === 0 ? 'multiple-choice' : 'numeric-input',
      choices: level % 6 === 0 ? choicesFor(answer, level) : undefined,
      explanation: `The machine uses formula family ${family + 1} with multiplier ${multiplier} and offset ${offset}.`,
      steps: [`${x} becomes ${fn(x)}.`, `${x + 2} becomes ${fn(x + 2)}.`, `${x + 4} becomes ${answer}.`],
      hints: hints('Use the completed input-output pairs.', 'The same operation happens to every input.', `Apply the rule to input ${x + 4}.`)
    }, inputOutput(pairs)), `${categoryId}:machine:${family}:${multiplier}:${offset}`);
  });
}

function gridCategory(categoryId: string): PuzzleDefinition[] {
  return Array.from({ length: LEVELS_PER_CATEGORY }, (_, index) => {
    const level = index + 1;
    const family = index % 8;
    const d = difficultyValue(level);
    const base = level + 2;
    const offset = Math.floor(level / 8) + 2;
    const common = {
      id: id(categoryId, level),
      chapterId: categoryId,
      levelNumber: level,
      title: title('Grid', level),
      type: 'grid' as const,
      prompt: 'Complete the grid relationship.',
      difficulty: d
    };
    const rowRule = (x: number, y: number): number => {
      if (family === 0) return x + y + offset;
      if (family === 1) return x * 2 + y + offset;
      if (family === 2) return y * 3 - x + offset;
      if (family === 3) return (x + y) * 2 + offset;
      if (family === 4) return x * y - offset;
      if (family === 5) return x * x + y + offset;
      if (family === 6) return y * y - x + offset;
      return (x + offset) + (y * 2);
    };
    const r1: [number, number, number] = [base, base + 1, rowRule(base, base + 1)];
    const r2: [number, number, number] = [base + 2, base + 3, rowRule(base + 2, base + 3)];
    const answer = rowRule(base + 4, base + 5);
    return decorate(grid({
      ...common,
      answer,
      answerMode: level % 7 === 0 ? 'multiple-choice' : 'numeric-input',
      choices: level % 7 === 0 ? choicesFor(answer, level) : undefined,
      explanation: `Each row follows the same rule using the first two cells.`,
      steps: [`Row 1: ${r1[0]} and ${r1[1]} produce ${r1[2]}.`, `Row 2: ${r2[0]} and ${r2[1]} produce ${r2[2]}.`, `Row 3 produces ${answer}.`],
      hints: hints('Read each row from left to right.', 'The third cell is made from the first two.', `Apply the row rule to ${base + 4} and ${base + 5}.`)
    }, [r1, r2, [base + 4, base + 5, null]]), `${categoryId}:grid-row:${family}:${offset}`);
  });
}

function ringCategory(categoryId: string): PuzzleDefinition[] {
  return Array.from({ length: LEVELS_PER_CATEGORY }, (_, index) => {
    const level = index + 1;
    const family = index % 8;
    const d = difficultyValue(level);
    const offset = Math.floor(level / 8) + 1;
    const a = level + 3;
    const rule = (value: number): number => {
      if (family === 0) return value + offset + 4;
      if (family === 1) return value * 2 + offset;
      if (family === 2) return value * 3 - offset;
      if (family === 3) return value + value % 5 + offset;
      if (family === 4) return value * value - offset;
      if (family === 5) return (value + offset) * 2;
      if (family === 6) return value * 4 + offset;
      return value + offset * 3;
    };
    const top = a;
    const right = a + 2;
    const bottom = a + 4;
    const left = a + 6;
    const answer = rule(top);
    const values = [top, right, bottom, left, null, rule(right), rule(bottom), rule(left)];
    return decorate(diagram({
      id: id(categoryId, level),
      chapterId: categoryId,
      levelNumber: level,
      title: title('Ring', level),
      type: 'ring',
      prompt: 'Find the missing opposite value.',
      difficulty: d,
      answer,
      answerMode: level % 6 === 0 ? 'multiple-choice' : 'numeric-input',
      choices: level % 6 === 0 ? choicesFor(answer, level) : undefined,
      explanation: `Each outer number connects to its opposite using the same ring rule.`,
      steps: [`${right} connects to ${rule(right)}.`, `${bottom} connects to ${rule(bottom)}.`, `${top} connects to ${answer}.`],
      hints: hints('Compare opposite positions.', 'Use the same operation on each opposite pair.', `Apply the ring rule to ${top}.`)
    }, ring(values)), `${categoryId}:ring-opposite:${family}:${offset}`);
  });
}

function mixedCategory(categoryId: string): PuzzleDefinition[] {
  return Array.from({ length: LEVELS_PER_CATEGORY }, (_, index) => {
    const level = index + 1;
    const family = index % 12;
    const d = difficultyValue(level);
    const a = level + 4;
    const b = (level % 12) + 3;
    const offset = Math.floor(level / 12) + 2;
    const common = {
      id: id(categoryId, level),
      chapterId: categoryId,
      levelNumber: level,
      title: title('Vault', level),
      prompt: 'Solve the mixed logic vault.',
      difficulty: d
    };

    if (family % 4 === 0) {
      const star = a + offset;
      const circle = b + offset;
      const answer = star + circle;
      return decorate(diagram({
        ...common,
        type: 'symbol-value' as const,
        answer,
        answerMode: 'numeric-input',
        explanation: `Solve the symbol values, then combine them.`,
        steps: [`◆ = ${star}`, `● = ${circle}`, `◆ + ● = ${answer}`],
        hints: hints('Find each symbol value first.', 'Use the first two equations to name the symbols.', `Add ${star} and ${circle}.`)
      }, symbolEquations([`◆ = ${star}`, `● = ${circle}`, `◆ + ● = ?`])), `${categoryId}:symbols:${star}:${circle}`);
    }

    if (family % 4 === 1) {
      const answer = a * 2 + b + offset;
      return decorate(diagram({
        ...common,
        type: 'balance' as const,
        answer,
        answerMode: 'multiple-choice',
        choices: choicesFor(answer, level),
        explanation: `The balance adds two copies of the first value, then the second value and offset.`,
        steps: [`Two copies: ${a} × 2 = ${a * 2}`, `Add ${b} and ${offset}.`, `Total = ${answer}.`],
        hints: hints('Count repeated symbols.', 'There are two copies of the first value.', `Calculate ${a} × 2 + ${b} + ${offset}.`)
      }, equationDiagram([`${a} + ${a} + ${b} + ${offset}`, '= ?'])), `${categoryId}:balance:${a}:${b}:${offset}`);
    }

    if (family % 4 === 2) {
      const answer = a * b - offset;
      return decorate(diagram({
        ...common,
        type: 'drag-and-drop' as const,
        answer,
        answerMode: 'drag-and-drop',
        choices: choicesFor(answer, level),
        explanation: `The open socket needs ${a} × ${b} - ${offset}.`,
        steps: [`${a} × ${b} = ${a * b}`, `${a * b} - ${offset} = ${answer}`, `Drag ${answer} into the socket.`],
        hints: hints('Multiply first.', 'Then subtract the small offset.', `Use ${a * b} - ${offset}.`)
      }, equationDiagram([`${a} × ${b} - ${offset}`, '= ?'])), `${categoryId}:drag-product:${a}:${b}:${offset}`);
    }

    const answer = (a + b) * offset;
    return decorate(diagram({
      ...common,
      type: 'equation' as const,
      answer,
      answerMode: 'numeric-input',
      explanation: `Add the pair first, then multiply by ${offset}.`,
      steps: [`${a} + ${b} = ${a + b}`, `${a + b} × ${offset} = ${answer}`, `The vault number is ${answer}.`],
      hints: hints('Use order of operations carefully.', 'The pair is grouped before multiplying.', `Calculate (${a} + ${b}) × ${offset}.`)
    }, equationDiagram([`(${a} + ${b}) × ${offset}`, '= ?'])), `${categoryId}:mixed-group:${a}:${b}:${offset}`);
  });
}

export const categories: ChapterDefinition[] = [
  {
    id: 'category-sequences',
    number: 1,
    title: 'Number Sequences',
    subtitle: 'Trails, gaps, alternating rules, and position patterns',
    icon: '↗',
    accent: '#57D3C8',
    puzzles: sequenceCategory('category-sequences')
  },
  {
    id: 'category-shapes',
    number: 2,
    title: 'Shape Logic',
    subtitle: 'Triangles, corners, and visual number codes',
    icon: '△',
    accent: '#F1C66A',
    puzzles: shapeCategory('category-shapes')
  },
  {
    id: 'category-machines',
    number: 3,
    title: 'Equation Machines',
    subtitle: 'Inputs, outputs, missing operators, and reverse rules',
    icon: 'ƒ',
    accent: '#9DA8FF',
    puzzles: equationCategory('category-machines')
  },
  {
    id: 'category-grids',
    number: 4,
    title: 'Grid Puzzles',
    subtitle: 'Rows, columns, and compact logic tables',
    icon: '▦',
    accent: '#62D68B',
    puzzles: gridCategory('category-grids')
  },
  {
    id: 'category-rings',
    number: 5,
    title: 'Number Rings',
    subtitle: 'Opposites, circles, and clock-like relationships',
    icon: '◉',
    accent: '#F09BC3',
    puzzles: ringCategory('category-rings')
  },
  {
    id: 'category-mixed',
    number: 6,
    title: 'Mixed Logic',
    subtitle: 'Symbols, balances, drag puzzles, and expert vaults',
    icon: '◇',
    accent: '#E89468',
    puzzles: mixedCategory('category-mixed')
  }
];
