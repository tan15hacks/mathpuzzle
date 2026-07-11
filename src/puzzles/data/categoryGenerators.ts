import type {
  CategoryDefinition,
  DiagramPuzzleData,
  DifficultyTier,
  PuzzleDefinition
} from '../PuzzleTypes';
import {
  diagram,
  equationDiagram,
  grid,
  hints,
  inputOutput,
  make,
  sequence
} from './helpers';

export const LEVELS_PER_CATEGORY = 320;
export const LEVELS_PER_TIER = 80;

export const DIFFICULTY_TIERS: readonly DifficultyTier[] = [
  'easy',
  'normal',
  'advanced',
  'expert'
];

function tierForLevel(level: number): DifficultyTier {
  return DIFFICULTY_TIERS[Math.min(3, Math.floor((level - 1) / LEVELS_PER_TIER))]!;
}

function difficultyForTier(tier: DifficultyTier): 1 | 2 | 3 | 4 | 5 {
  if (tier === 'easy') return 1;
  if (tier === 'normal') return 2;
  if (tier === 'advanced') return 4;
  return 5;
}

function details(level: number): {
  tier: DifficultyTier;
  tierIndex: number;
  slot: number;
  family: number;
  variant: number;
} {
  const tierIndex = Math.min(3, Math.floor((level - 1) / LEVELS_PER_TIER));
  const slot = (level - 1) % LEVELS_PER_TIER;
  return {
    tier: tierForLevel(level),
    tierIndex,
    slot,
    family: slot % 10,
    variant: Math.floor(slot / 10)
  };
}

function pick(seed: number, min: number, span: number): number {
  const mixed = Math.imul(seed ^ 0x9e3779b9, 0x85ebca6b) ^ (seed >>> 13);
  return min + ((mixed >>> 0) % span);
}

function rotate<T>(values: T[], offset: number): T[] {
  const shift = ((offset % values.length) + values.length) % values.length;
  return [...values.slice(shift), ...values.slice(0, shift)];
}

function choices(answer: number, seed: number, gap = 1): number[] {
  const candidates = [
    answer,
    answer + gap,
    answer - gap,
    answer + gap * 2,
    answer - gap * 2,
    answer + gap * 3
  ];
  const unique = [...new Set(candidates)].filter((value) => Number.isFinite(value)).slice(0, 4);
  return rotate(unique, seed);
}

function baseArgs(
  categoryId: string,
  level: number,
  familyKey: string,
  title: string,
  prompt: string,
  answer: number | string,
  explanation: string,
  steps: string[],
  hintText: [string, string, string]
) {
  const { tier, tierIndex, variant } = details(level);
  return {
    id: `${categoryId}-level-${level}`,
    chapterId: categoryId,
    categoryId,
    levelNumber: level,
    title: `${title} ${level}`,
    type: 'sequence' as const,
    prompt,
    difficulty: difficultyForTier(tier),
    difficultyTier: tier,
    answer,
    explanation,
    steps,
    hints: hints(...hintText),
    uniquenessKey: `${categoryId}:${familyKey}:${tierIndex}:${variant}:${steps.join('|')}`
  };
}

function shapePanels(
  groups: Array<[number, number, number | null]>,
  shapeKind: number
): DiagramPuzzleData {
  const labels: DiagramPuzzleData['labels'] = [];
  const lines: NonNullable<DiagramPuzzleData['lines']> = [];
  const rects: NonNullable<DiagramPuzzleData['rects']> = [];
  const xPositions = [-2.7, 0, 2.7];

  groups.forEach(([left, right, result], index) => {
    const x = xPositions[index]!;
    labels.push(
      { text: String(left), x: x - 0.62, y: 0.78, style: 'node' },
      { text: String(right), x: x + 0.62, y: 0.78, style: 'node' },
      {
        text: result === null ? '?' : String(result),
        x,
        y: -0.82,
        style: result === null ? 'missing' : 'node'
      }
    );

    if (shapeKind === 0) {
      lines.push(
        { from: [x - 0.5, 0.51], to: [x, -0.5] },
        { from: [x + 0.5, 0.51], to: [x, -0.5] },
        { from: [x - 0.42, 0.63], to: [x + 0.42, 0.63] }
      );
    } else if (shapeKind === 1) {
      rects.push({ x, y: 0, width: 1.75, height: 2.15 });
      lines.push({ from: [x - 0.88, 0], to: [x + 0.88, 0] });
    } else if (shapeKind === 2) {
      lines.push(
        { from: [x, 1.12], to: [x + 0.92, 0] },
        { from: [x + 0.92, 0], to: [x, -1.12] },
        { from: [x, -1.12], to: [x - 0.92, 0] },
        { from: [x - 0.92, 0], to: [x, 1.12] }
      );
    } else {
      lines.push(
        { from: [x - 0.95, 0.65], to: [x + 0.95, 0.65] },
        { from: [x, 1.18], to: [x, -1.17] },
        { from: [x - 0.72, -0.45], to: [x + 0.72, -0.45], dashed: true }
      );
    }
  });

  return { kind: 'diagram', labels, lines, rects };
}

function ringWithCenter(
  values: Array<number | string | null>,
  centerText: string
): DiagramPuzzleData {
  const radius = 2.35;
  return {
    kind: 'diagram',
    circles: [{ x: 0, y: 0, radius: 1.62 }],
    labels: [
      ...values.map((value, index) => {
        const angle = Math.PI / 2 - (index / values.length) * Math.PI * 2;
        return {
          text: value === null ? '?' : String(value),
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * radius,
          style: value === null ? ('missing' as const) : ('node' as const)
        };
      }),
      { text: centerText, x: 0, y: 0, style: 'symbol' as const }
    ],
    lines: values.map((_, index) => {
      const angle = Math.PI / 2 - (index / values.length) * Math.PI * 2;
      return {
        from: [Math.cos(angle) * 0.45, Math.sin(angle) * 0.45] as [number, number],
        to: [Math.cos(angle) * 1.52, Math.sin(angle) * 1.52] as [number, number]
      };
    })
  };
}

function generateNumberPattern(level: number): PuzzleDefinition {
  const { tierIndex, family, variant } = details(level);
  const seed = 1000 + level * 31;
  const scale = tierIndex + 1;
  const titleNames = [
    'Steady Rise',
    'Reverse Current',
    'Power Pulse',
    'Alternating Beat',
    'Expanding Gaps',
    'Curve Trail',
    'Neighbor Echo',
    'Twin Tracks',
    'Transform Chain',
    'Indexed Steps'
  ];
  const prompt = [
    'Find the next number in the pattern.',
    'Continue the number trail.',
    'Complete the final position.',
    'Which value belongs in the empty node?'
  ][(family + variant) % 4]!;

  let values: number[] = [];
  let answer = 0;
  let explanation = '';
  let steps: string[] = [];
  let hintText: [string, string, string];
  let type: PuzzleDefinition['type'] = 'sequence';

  if (family === 0) {
    const start = pick(seed, 1 + scale, 13 + scale * 3);
    const step = 2 + scale + variant;
    values = Array.from({ length: 5 }, (_, index) => start + index * step);
    answer = start + 5 * step;
    explanation = `The same amount, ${step}, is added each time.`;
    steps = values.slice(0, 4).map((value) => `${value} + ${step} = ${value + step}`);
    steps.push(`${values[4]} + ${step} = ${answer}`);
    hintText = ['Compare neighboring values.', 'The difference never changes.', `Add ${step} to ${values[4]}.`];
  } else if (family === 1) {
    const step = 3 + scale + variant;
    answer = pick(seed, 1, 12 + scale * 2);
    const start = answer + step * 5;
    values = Array.from({ length: 5 }, (_, index) => start - index * step);
    explanation = `Every value decreases by ${step}.`;
    steps = values.slice(0, 4).map((value) => `${value} − ${step} = ${value - step}`);
    steps.push(`${values[4]} − ${step} = ${answer}`);
    hintText = ['The trail moves downward.', 'Use one constant subtraction.', `Subtract ${step} from ${values[4]}.`];
  } else if (family === 2) {
    const factor = 2 + Math.min(2, tierIndex);
    const start = 1 + (variant % 3) + tierIndex;
    values = Array.from({ length: 5 }, (_, index) => start * factor ** index);
    answer = start * factor ** 5;
    explanation = `Each value is multiplied by ${factor}.`;
    steps = values.slice(0, 4).map((value) => `${value} × ${factor} = ${value * factor}`);
    steps.push(`${values[4]} × ${factor} = ${answer}`);
    hintText = ['The values grow by a fixed factor.', 'Use multiplication, not addition.', `Multiply ${values[4]} by ${factor}.`];
  } else if (family === 3) {
    const add = 3 + scale + variant;
    const subtract = 1 + ((variant + tierIndex) % 4);
    const start = pick(seed, 2, 9 + scale);
    values = [start];
    for (let index = 0; index < 5; index += 1) {
      values.push(values[index]! + (index % 2 === 0 ? add : -subtract));
    }
    answer = values.pop()!;
    explanation = `The operations alternate: add ${add}, then subtract ${subtract}.`;
    steps = values.slice(0, 4).map((value, index) => {
      const operation = index % 2 === 0 ? add : -subtract;
      return `${value} ${operation >= 0 ? '+' : '−'} ${Math.abs(operation)} = ${value + operation}`;
    });
    steps.push(`${values[4]} + ${add} = ${answer}`);
    hintText = ['One operation is not enough.', 'The rule alternates between addition and subtraction.', `The next move adds ${add}.`];
    type = 'alternating-sequence';
  } else if (family === 4) {
    const start = pick(seed, 1, 10 + scale);
    const firstGap = 2 + scale + variant;
    const gapIncrease = 1 + tierIndex + (variant % 2);
    values = [start];
    for (let index = 0; index < 4; index += 1) {
      values.push(values[index]! + firstGap + index * gapIncrease);
    }
    answer = values[4]! + firstGap + 4 * gapIncrease;
    explanation = `The gaps begin at ${firstGap} and increase by ${gapIncrease}.`;
    const gaps = Array.from({ length: 5 }, (_, index) => firstGap + index * gapIncrease);
    steps = gaps.map((gap, index) => `${index === 4 ? values[4] : values[index]} + ${gap} = ${index === 4 ? answer : values[index + 1]}`);
    hintText = ['Study the gaps between values.', `Each gap grows by ${gapIncrease}.`, `The next gap is ${gaps[4]}.`];
  } else if (family === 5) {
    const a = 1 + tierIndex + (variant % 3);
    const b = 1 + variant + tierIndex;
    const c = pick(seed, 0, 8);
    const formula = (n: number): number => a * n * n + b * n + c;
    values = Array.from({ length: 5 }, (_, index) => formula(index + 1));
    answer = formula(6);
    explanation = `Position n follows ${a}n² + ${b}n + ${c}.`;
    steps = [
      `For n = 4: ${a}×4² + ${b}×4 + ${c} = ${values[3]}`,
      `For n = 5: ${a}×5² + ${b}×5 + ${c} = ${values[4]}`,
      `For n = 6: ${a}×6² + ${b}×6 + ${c} = ${answer}`
    ];
    hintText = ['The first differences are not constant.', 'Look for a quadratic position rule.', `Evaluate ${a}×6² + ${b}×6 + ${c}.`];
  } else if (family === 6) {
    const offset = tierIndex + variant;
    const first = 1 + (variant % 4);
    const second = 2 + tierIndex + (variant % 5);
    values = [first, second];
    while (values.length < 5) {
      const size = values.length;
      values.push(values[size - 1]! + values[size - 2]! + offset);
    }
    answer = values[4]! + values[3]! + offset;
    explanation = `Each value is the sum of the previous two, then ${offset} is added.`;
    steps = [
      `${values[0]} + ${values[1]} + ${offset} = ${values[2]}`,
      `${values[1]} + ${values[2]} + ${offset} = ${values[3]}`,
      `${values[2]} + ${values[3]} + ${offset} = ${values[4]}`,
      `${values[3]} + ${values[4]} + ${offset} = ${answer}`
    ];
    hintText = ['Use groups of three values.', 'Combine the previous two values.', `Add ${values[3]}, ${values[4]}, and ${offset}.`];
  } else if (family === 7) {
    const oddStart = 2 + variant + tierIndex;
    const evenStart = 5 + scale + variant;
    const oddStep = 2 + scale;
    const evenStep = 3 + variant;
    values = [
      oddStart,
      evenStart,
      oddStart + oddStep,
      evenStart + evenStep,
      oddStart + oddStep * 2,
      evenStart + evenStep * 2
    ];
    answer = oddStart + oddStep * 3;
    explanation = `Odd and even positions form two separate arithmetic trails.`;
    steps = [
      `Odd positions: ${oddStart}, ${oddStart + oddStep}, ${oddStart + oddStep * 2}, ${answer}`,
      `The odd-position step is +${oddStep}.`
    ];
    hintText = ['Separate the odd and even positions.', 'Follow the first, third, fifth, and seventh values.', `Add ${oddStep} to ${values[4]}.`];
    type = 'alternating-sequence';
  } else if (family === 8) {
    const multiplier = 2 + (tierIndex >= 2 ? 1 : 0);
    const add = 1 + variant + tierIndex;
    const start = 1 + (variant % 4);
    values = [start];
    for (let index = 0; index < 4; index += 1) {
      values.push(values[index]! * multiplier + add);
    }
    answer = values[4]! * multiplier + add;
    explanation = `Multiply by ${multiplier}, then add ${add}.`;
    steps = values.slice(0, 4).map((value) => `${value} × ${multiplier} + ${add} = ${value * multiplier + add}`);
    steps.push(`${values[4]} × ${multiplier} + ${add} = ${answer}`);
    hintText = ['Each step uses two operations.', `Multiply first, then add ${add}.`, `Calculate ${values[4]} × ${multiplier} + ${add}.`];
  } else {
    const start = pick(seed, 1, 9 + scale);
    const coefficient = 1 + scale + (variant % 3);
    const constant = variant + tierIndex;
    values = [start];
    for (let index = 1; index < 5; index += 1) {
      values.push(values[index - 1]! + coefficient * index + constant);
    }
    answer = values[4]! + coefficient * 5 + constant;
    explanation = `At step n, add ${coefficient}n + ${constant}.`;
    steps = [
      `Step 3 adds ${coefficient}×3 + ${constant}.`,
      `Step 4 adds ${coefficient}×4 + ${constant}.`,
      `Step 5 adds ${coefficient}×5 + ${constant} = ${coefficient * 5 + constant}.`,
      `${values[4]} + ${coefficient * 5 + constant} = ${answer}`
    ];
    hintText = ['The added amount changes with the position.', 'The increase follows a linear position rule.', `The next increase is ${coefficient * 5 + constant}.`];
  }

  const args = baseArgs(
    'number-patterns',
    level,
    `family-${family}`,
    titleNames[family]!,
    prompt,
    answer,
    explanation,
    steps,
    hintText
  );
  const answerMode = level % 7 === 0 ? 'multiple-choice' : level % 11 === 0 ? 'drag-and-drop' : 'numeric-input';
  return sequence(
    {
      ...args,
      type,
      answerMode,
      choices: answerMode === 'numeric-input' ? undefined : choices(answer, seed, Math.max(1, scale + variant))
    },
    [...values, null]
  );
}

function generateShapeLogic(level: number): PuzzleDefinition {
  const { tierIndex, family, variant } = details(level);
  const seed = 2000 + level * 37;
  const scale = tierIndex + 1;
  const k = 1 + scale + (variant % 4);
  const pair = (offset: number): [number, number] => {
    const right = pick(seed + offset * 11, 2 + scale, 6 + scale * 3);
    const left = right + 1 + pick(seed + offset * 17, 0, 5 + variant);
    return [left, right];
  };
  const formulaNames = [
    'sum plus a key',
    'the product',
    'product minus both inputs',
    'left squared plus right',
    'difference of squares',
    'sum multiplied by a key',
    'product plus the right value',
    'left multiplied by an adjusted right value',
    'sum of two squares',
    'product of the sum and difference'
  ];
  const calculate = (left: number, right: number): number => {
    switch (family) {
      case 0: return left + right + k;
      case 1: return left * right;
      case 2: return left * right - left - right;
      case 3: return left * left + right;
      case 4: return left * left - right * right;
      case 5: return (left + right) * k;
      case 6: return left * right + right;
      case 7: return left * (right + k);
      case 8: return left * left + right * right;
      default: return (left + right) * (left - right);
    }
  };
  const pairs = [pair(1), pair(2), pair(3)] as const;
  const results = pairs.map(([left, right]) => calculate(left, right));
  const answer = results[2]!;
  const ruleText = formulaNames[family]!;
  const examples = pairs.slice(0, 2).map(([left, right], index) => {
    return `${left} and ${right} produce ${results[index]}.`;
  });
  const steps = [
    ...examples,
    `Apply ${ruleText} to ${pairs[2][0]} and ${pairs[2][1]}.`,
    `The missing value is ${answer}.`
  ];
  const prompt = ['Complete the final shape.', 'Find the missing shape value.', 'Use the same rule in all three panels.'][(family + variant) % 3]!;
  const args = baseArgs(
    'shape-logic',
    level,
    `shape-${family}:${k}:${pairs.flat().join(',')}`,
    ['Triangle Link', 'Square Circuit', 'Diamond Code', 'Cross Relation'][family % 4]!,
    prompt,
    answer,
    `Every panel uses ${ruleText}.`,
    steps,
    [
      'Compare the two completed panels before solving the last one.',
      `The rule uses ${ruleText}.`,
      `Apply that rule to ${pairs[2][0]} and ${pairs[2][1]}.`
    ]
  );
  const answerMode = level % 6 === 0 ? 'multiple-choice' : level % 13 === 0 ? 'drag-and-drop' : 'numeric-input';
  return diagram(
    {
      ...args,
      type: family % 2 === 0 ? 'shape-code' : 'triangle',
      answerMode,
      choices: answerMode === 'numeric-input' ? undefined : choices(answer, seed, Math.max(1, k))
    },
    shapePanels(
      [
        [pairs[0][0], pairs[0][1], results[0]!],
        [pairs[1][0], pairs[1][1], results[1]!],
        [pairs[2][0], pairs[2][1], null]
      ],
      family % 4
    )
  );
}

function generateEquationMachine(level: number): PuzzleDefinition {
  const { tierIndex, family, variant } = details(level);
  const seed = 3000 + level * 41;
  const scale = tierIndex + 1;
  const a = 2 + tierIndex + (variant % 4);
  const b = 1 + variant + scale;
  const c = pick(seed, 0, 7 + scale);
  const inputs = Array.from(
    { length: 4 },
    (_, index) => 1 + index + variant + tierIndex * 12
  );
  const formulaNames = [
    `add ${b}`,
    `multiply by ${a}`,
    `multiply by ${a}, then add ${b}`,
    `square the input, then add ${b}`,
    `multiply the input by input plus ${a}`,
    `add ${b}, then multiply by ${a}`,
    `use ${a}x² + ${b}x + ${c}`,
    `use x² − ${a}x + ${b + a * a}`,
    `use one square rule for even inputs and another for odd inputs`,
    'choose the missing operator'
  ];

  if (family === 9) {
    const operators = ['+', '−', '×', '÷'] as const;
    const operator = operators[(variant + tierIndex) % operators.length]!;
    let left = 8 + tierIndex * 40 + variant * 5 + pick(seed, 0, 11 + scale * 2);
    let right = 2 + tierIndex * 3 + variant + pick(seed + 9, 0, 5 + scale);
    let result: number;
    if (operator === '+') result = left + right;
    else if (operator === '−') {
      if (right > left) [left, right] = [right, left];
      result = left - right;
    } else if (operator === '×') result = left * right;
    else {
      result = left;
      left *= right;
    }
    const args = baseArgs(
      'equation-machines',
      level,
      `operator:${operator}:${left}:${right}:${result}`,
      'Operator Switch',
      'Choose the operator that makes the equation true.',
      operator,
      `The missing operator is ${operator}.`,
      [`Test the four basic operations.`, `${left} ${operator} ${right} = ${result}.`],
      [
        'Compare the target with the two visible numbers.',
        'Try addition, subtraction, multiplication, and division.',
        `${left} ${operator} ${right} reaches ${result}.`
      ]
    );
    return make(
      {
        ...args,
        type: 'missing-operator',
        answerMode: 'operator-selection',
        choices: ['+', '−', '×', '÷']
      },
      equationDiagram([`${left}  ?  ${right}  =  ${result}`])
    );
  }

  const calculate = (x: number): number => {
    switch (family) {
      case 0: return x + b;
      case 1: return x * a;
      case 2: return x * a + b;
      case 3: return x * x + b;
      case 4: return x * (x + a);
      case 5: return (x + b) * a;
      case 6: return a * x * x + b * x + c;
      case 7: return x * x - a * x + b + a * a;
      default: return x % 2 === 0 ? x * x + b : x * x - a;
    }
  };
  const outputs = inputs.map(calculate);
  const answer = outputs[3]!;
  const shownPairs: Array<[number | string, number | string | null]> = [
    [inputs[0]!, outputs[0]!],
    [inputs[1]!, outputs[1]!],
    [inputs[2]!, outputs[2]!],
    [inputs[3]!, null]
  ];
  const args = baseArgs(
    'equation-machines',
    level,
    `machine-${family}:${a}:${b}:${c}:${inputs.join(',')}`,
    [
      'Offset Machine',
      'Multiplier Gate',
      'Affine Engine',
      'Square Box',
      'Product Fold',
      'Two-Step Processor',
      'Quadratic Core',
      'Reverse Curve',
      'Parity Machine'
    ][family]!,
    'Find the output for the final input.',
    answer,
    `The machine rule is: ${formulaNames[family]}.`,
    [
      `${inputs[0]} maps to ${outputs[0]}.`,
      `${inputs[1]} maps to ${outputs[1]}.`,
      `Apply the same rule to ${inputs[3]} to get ${answer}.`
    ],
    [
      'Compare each input with its output.',
      `The rule tells you to ${formulaNames[family]}.`,
      `Apply it to ${inputs[3]}.`
    ]
  );
  const answerMode = level % 8 === 0 ? 'multiple-choice' : 'numeric-input';
  return diagram(
    {
      ...args,
      type: family <= 1 ? 'input-output' : 'equation',
      answerMode,
      choices: answerMode === 'numeric-input' ? undefined : choices(answer, seed, Math.max(1, a + variant))
    },
    inputOutput(shownPairs)
  );
}

function generateGridLogic(level: number): PuzzleDefinition {
  const { tierIndex, family, variant } = details(level);
  const seed = 4000 + level * 43;
  const scale = tierIndex + 1;
  const k = 1 + scale + (variant % 5);

  if (family === 9) {
    const row1 = [pick(seed, 2, 9 + scale), pick(seed + 1, 3, 10 + scale), pick(seed + 2, 4, 11 + scale)];
    const row2 = [pick(seed + 3, 4, 12 + scale), pick(seed + 4, 5, 13 + scale), pick(seed + 5, 6, 14 + scale)];
    const row3 = row1.map((value, index) => value + row2[index]! + k);
    const answer = row3[2]!;
    const args = baseArgs(
      'grid-logic',
      level,
      `column-sum:${k}:${row1.join(',')}:${row2.join(',')}`,
      'Column Foundation',
      'Complete the bottom-right cell.',
      answer,
      `Each bottom cell equals the two cells above it plus ${k}.`,
      [
        `${row1[0]} + ${row2[0]} + ${k} = ${row3[0]}`,
        `${row1[1]} + ${row2[1]} + ${k} = ${row3[1]}`,
        `${row1[2]} + ${row2[2]} + ${k} = ${answer}`
      ],
      [
        'Read the grid by columns.',
        `Combine the top and middle cells, then add ${k}.`,
        `Calculate ${row1[2]} + ${row2[2]} + ${k}.`
      ]
    );
    return grid({ ...args, type: 'grid' }, [row1, row2, [row3[0]!, row3[1]!, null]]);
  }

  const calculate = (left: number, right: number): number => {
    switch (family) {
      case 0: return left + right + k;
      case 1: return left * right;
      case 2: return left * right + left + right;
      case 3: return (left - right) * k;
      case 4: return left * left + right;
      case 5: return (left + right) * k;
      case 6: return left * right - left;
      case 7: return left * left - right * right;
      default: return 2 * left + right + k;
    }
  };
  const rows: Array<[number, number]> = Array.from({ length: 3 }, (_, index) => {
    const right = pick(seed + index * 19, 2 + scale, 6 + scale * 2);
    const left = right + 1 + pick(seed + index * 23, 0, 5 + variant);
    return [left, right];
  });
  const results = rows.map(([left, right]) => calculate(left, right));
  const answer = results[2]!;
  const ruleDescriptions = [
    `add the first two cells and then add ${k}`,
    'multiply the first two cells',
    'multiply the first two cells, then add both inputs',
    `subtract the second cell from the first, then multiply by ${k}`,
    'square the first cell, then add the second',
    `add the first two cells, then multiply by ${k}`,
    'multiply the cells, then subtract the first',
    'subtract the second square from the first square',
    `double the first cell, add the second, then add ${k}`
  ];
  const args = baseArgs(
    'grid-logic',
    level,
    `row-rule-${family}:${k}:${rows.flat().join(',')}`,
    'Row Cipher',
    'Find the missing value in the last row.',
    answer,
    `In every row, ${ruleDescriptions[family]}.`,
    [
      `${rows[0]![0]} and ${rows[0]![1]} produce ${results[0]}.`,
      `${rows[1]![0]} and ${rows[1]![1]} produce ${results[1]}.`,
      `${rows[2]![0]} and ${rows[2]![1]} produce ${answer}.`
    ],
    [
      'Solve the completed rows first.',
      `The row rule is to ${ruleDescriptions[family]}.`,
      `Apply the rule to ${rows[2]![0]} and ${rows[2]![1]}.`
    ]
  );
  const answerMode = level % 9 === 0 ? 'multiple-choice' : 'numeric-input';
  return grid(
    {
      ...args,
      type: 'grid',
      answerMode,
      choices: answerMode === 'numeric-input' ? undefined : choices(answer, seed, Math.max(1, k))
    },
    [
      [rows[0]![0], rows[0]![1], results[0]!],
      [rows[1]![0], rows[1]![1], results[1]!],
      [rows[2]![0], rows[2]![1], null]
    ]
  );
}

function generateNumberRing(level: number): PuzzleDefinition {
  const { tierIndex, family, variant } = details(level);
  const seed = 5000 + level * 47;
  const scale = tierIndex + 1;
  const k = 2 + scale + (variant % 5);
  const c = 1 + variant + tierIndex;
  const leftValues = Array.from({ length: 4 }, (_, index) => {
    return 2 + index + variant + tierIndex + pick(seed + index * 5, 0, 3);
  });
  let centerText = 'RULE';
  let explanation = '';
  const transform = (value: number): number => {
    switch (family) {
      case 0: {
        const total = 24 + tierIndex * 12 + variant * 2;
        centerText = `Σ ${total}`;
        explanation = `Every opposite pair adds to ${total}.`;
        return total - value;
      }
      case 1:
        centerText = `+${k}`;
        explanation = `The opposite value is ${k} greater.`;
        return value + k;
      case 2: {
        const total = 120 * (1 + tierIndex * 10 + variant);
        const divisors = [2, 3, 4, 6];
        const index = leftValues.indexOf(value);
        const divisor = divisors[index]!;
        leftValues[index] = divisor;
        centerText = `× ${total}`;
        explanation = `Every opposite pair multiplies to ${total}.`;
        return total / divisor;
      }
      case 3:
        centerText = `×${k}`;
        explanation = `The opposite value is multiplied by ${k}.`;
        return value * k;
      case 4:
        centerText = `×${k}+${c}`;
        explanation = `Multiply by ${k}, then add ${c} to get the opposite value.`;
        return value * k + c;
      case 5:
        centerText = `x²+${c}`;
        explanation = `Square the first value, then add ${c}.`;
        return value * value + c;
      case 6:
        centerText = `(+${c})×${k}`;
        explanation = `Add ${c}, then multiply by ${k}.`;
        return (value + c) * k;
      case 7:
        centerText = `x²−x+${c}`;
        explanation = `Use x² − x + ${c} for every opposite pair.`;
        return value * value - value + c;
      case 8:
        centerText = `2x+${k}`;
        explanation = `Double the first value, then add ${k}.`;
        return 2 * value + k;
      default:
        centerText = `${k + 1}x−${c}`;
        explanation = `Multiply by ${k + 1}, then subtract ${c}.`;
        return value * (k + 1) - c;
    }
  };
  const oppositeValues = leftValues.map(transform);
  const answer = oppositeValues[3]!;
  const values: Array<number | string | null> = [
    leftValues[0]!,
    leftValues[1]!,
    leftValues[2]!,
    leftValues[3]!,
    oppositeValues[0]!,
    oppositeValues[1]!,
    oppositeValues[2]!,
    null
  ];
  const args = baseArgs(
    'number-rings',
    level,
    `ring-${family}:${k}:${c}:${leftValues.join(',')}:${oppositeValues.join(',')}`,
    'Opposite Orbit',
    'Find the missing number opposite its partner.',
    answer,
    explanation,
    [
      `${leftValues[0]} pairs with ${oppositeValues[0]}.`,
      `${leftValues[1]} pairs with ${oppositeValues[1]}.`,
      `${leftValues[3]} pairs with ${answer}.`
    ],
    [
      'Read values directly across the center.',
      explanation,
      `Apply the same rule to ${leftValues[3]}.`
    ]
  );
  const answerMode = level % 10 === 0 ? 'drag-and-drop' : level % 7 === 0 ? 'multiple-choice' : 'numeric-input';
  return diagram(
    {
      ...args,
      type: 'ring',
      answerMode,
      choices: answerMode === 'numeric-input' ? undefined : choices(answer, seed, Math.max(1, k))
    },
    ringWithCenter(values, centerText)
  );
}

function generateLogicMix(level: number): PuzzleDefinition {
  const { tierIndex, family, variant } = details(level);
  const seed = 6000 + level * 53;
  const scale = tierIndex + 1;
  const symbols = [
    ['△', '○', '◇'],
    ['□', '☆', '⬡'],
    ['◆', '●', '▲'],
    ['♢', '◉', '▣']
  ][(family + variant) % 4]!;
  const [symbolA, symbolB, symbolC] = symbols;
  const a = 2 + scale + variant;
  const b = 3 + tierIndex + (variant % 5);
  const c = 1 + scale + (variant % 4);
  let lines: string[] = [];
  let answer = 0;
  let explanation = '';
  let steps: string[] = [];
  let finalPrompt = 'Solve the final line.';

  if (family === 0) {
    lines = [`${symbolA} + ${symbolA} = ${a * 2}`, `${symbolA} + ${symbolB} = ${a + b}`, `${symbolB} = ?`];
    answer = b;
    explanation = `The first line gives ${symbolA} = ${a}; substitute it into the second line.`;
    steps = [`${a * 2} ÷ 2 = ${a}`, `${a + b} − ${a} = ${b}`];
  } else if (family === 1) {
    const ab = a + b;
    const bc = b + c;
    const ac = a + c;
    lines = [`${symbolA}+${symbolB}=${ab}`, `${symbolB}+${symbolC}=${bc}`, `${symbolA}+${symbolC}=${ac}`, `${symbolA}+${symbolB}+${symbolC}=?`];
    answer = a + b + c;
    explanation = 'Adding all three pair sums counts every symbol twice.';
    steps = [`${ab} + ${bc} + ${ac} = ${(a + b + c) * 2}`, `${(a + b + c) * 2} ÷ 2 = ${answer}`];
  } else if (family === 2) {
    lines = [`${symbolA} × ${symbolA} = ${a * a}`, `${symbolA} + ${symbolB} = ${a + b}`, `${symbolB} × ${symbolC} = ${b * c}`, `${symbolA}+${symbolB}+${symbolC}=?`];
    answer = a + b + c;
    explanation = `Use the positive value ${symbolA} = ${a}, then solve ${symbolB} and ${symbolC}.`;
    steps = [`√${a * a} = ${a}`, `${a + b} − ${a} = ${b}`, `${b * c} ÷ ${b} = ${c}`, `${a}+${b}+${c}=${answer}`];
  } else if (family === 3) {
    const first = 2 * a + b;
    const second = a + 2 * b;
    lines = [`2${symbolA} + ${symbolB} = ${first}`, `${symbolA} + 2${symbolB} = ${second}`, `${symbolA} + ${symbolB} = ?`];
    answer = a + b;
    explanation = 'Add the two equations, then divide by 3.';
    steps = [`${first} + ${second} = ${3 * (a + b)}`, `${3 * (a + b)} ÷ 3 = ${answer}`];
  } else if (family === 4) {
    lines = [`${symbolA}+${symbolB}=${a + b}`, `${symbolB}×${symbolC}=${b * c}`, `${symbolA}−${symbolC}=${a - c}`, `${symbolA}+${symbolB}+${symbolC}=?`];
    answer = a + b + c;
    explanation = 'The sum and difference lines identify the three symbol values.';
    steps = [`${symbolA}=${a}, ${symbolB}=${b}, ${symbolC}=${c}`, `${a}+${b}+${c}=${answer}`];
  } else if (family === 5) {
    const multiplier = 2 + tierIndex;
    lines = [`${symbolA} = ${a}`, `${symbolB} = ${symbolA} × ${multiplier}`, `${symbolC} = ${symbolB} − ${c}`, `${symbolA}+${symbolB}+${symbolC}=?`];
    const valueB = a * multiplier;
    const valueC = valueB - c;
    answer = a + valueB + valueC;
    explanation = 'Follow the symbol chain from top to bottom.';
    steps = [`${symbolB}=${a}×${multiplier}=${valueB}`, `${symbolC}=${valueB}−${c}=${valueC}`, `${a}+${valueB}+${valueC}=${answer}`];
  } else if (family === 6) {
    const total = a * 3 + b * 2;
    lines = [`3${symbolA} + 2${symbolB} = ${total}`, `${symbolA} = ${a}`, `${symbolB} = ?`];
    answer = b;
    explanation = `Replace ${symbolA} with ${a}, subtract its contribution, then divide by 2.`;
    steps = [`3×${a}=${a * 3}`, `${total}−${a * 3}=${b * 2}`, `${b * 2}÷2=${b}`];
  } else if (family === 7) {
    const operators = ['+', '−', '×'] as const;
    const operator = operators[(variant + tierIndex) % operators.length]!;
    const left = a + b + tierIndex * 24;
    const right = c + 1 + variant;
    const result = operator === '+' ? left + right : operator === '−' ? left - right : left * right;
    lines = [`${left} ? ${right} = ${result}`];
    finalPrompt = 'Choose the missing operator.';
    const args = baseArgs(
      'logic-mix',
      level,
      `mixed-operator:${left}:${right}:${operator}:${result}`,
      'Logic Operator',
      finalPrompt,
      operator,
      `The operator is ${operator}.`,
      [`${left} ${operator} ${right} = ${result}.`],
      ['Compare the result with both numbers.', 'Test the basic operators.', `${left} ${operator} ${right} gives ${result}.`]
    );
    return make(
      {
        ...args,
        type: 'missing-operator',
        answerMode: 'operator-selection',
        choices: ['+', '−', '×', '÷']
      },
      equationDiagram(lines)
    );
  } else if (family === 8) {
    const valueA = a * scale;
    const valueB = valueA + b;
    const valueC = valueB * 2 - c;
    lines = [`${symbolA}=${valueA}`, `${symbolB}=${symbolA}+${b}`, `${symbolC}=2${symbolB}−${c}`, `${symbolC}−${symbolA}=?`];
    answer = valueC - valueA;
    explanation = 'Evaluate each assignment before using the final subtraction.';
    steps = [`${symbolB}=${valueA}+${b}=${valueB}`, `${symbolC}=2×${valueB}−${c}=${valueC}`, `${valueC}−${valueA}=${answer}`];
  } else {
    const codeA = a * 10 + b;
    const codeB = b * 10 + c;
    lines = [`${symbolA}${symbolB} = ${codeA}`, `${symbolB}${symbolC} = ${codeB}`, `${symbolA}+${symbolB}+${symbolC}=?`];
    answer = a + b + c;
    explanation = 'Adjacent symbols form two-digit numbers, revealing each digit.';
    steps = [`${symbolA}=${a} and ${symbolB}=${b}`, `${symbolB}=${b} and ${symbolC}=${c}`, `${a}+${b}+${c}=${answer}`];
  }

  const args = baseArgs(
    'logic-mix',
    level,
    `logic-${family}:${a}:${b}:${c}:${lines.join(';')}`,
    'Symbol Reasoning',
    finalPrompt,
    answer,
    explanation,
    steps,
    [
      'Solve the equations from the simplest line first.',
      'Substitute known symbol values into the remaining lines.',
      `The final calculation produces ${answer}.`
    ]
  );
  const answerMode = level % 6 === 0 ? 'multiple-choice' : level % 17 === 0 ? 'drag-and-drop' : 'numeric-input';
  return make(
    {
      ...args,
      type: family % 3 === 0 ? 'balance' : 'symbol-value',
      answerMode,
      choices: answerMode === 'numeric-input' ? undefined : choices(answer, seed, Math.max(1, scale + variant))
    },
    equationDiagram(lines)
  );
}

function buildCategory(
  definition: Omit<CategoryDefinition, 'puzzles'>,
  generator: (level: number) => PuzzleDefinition
): CategoryDefinition {
  return {
    ...definition,
    puzzles: Array.from({ length: LEVELS_PER_CATEGORY }, (_, index) => generator(index + 1))
  };
}

export function generateCategories(): CategoryDefinition[] {
  return [
    buildCategory(
      {
        id: 'number-patterns',
        number: 1,
        title: 'Number Patterns',
        subtitle: 'Sequences, recurrences, and changing gaps',
        icon: '↗',
        accent: '#57D3C8'
      },
      generateNumberPattern
    ),
    buildCategory(
      {
        id: 'shape-logic',
        number: 2,
        title: 'Shape Logic',
        subtitle: 'Triangles, squares, diamonds, and visual rules',
        icon: '△',
        accent: '#F1C66A'
      },
      generateShapeLogic
    ),
    buildCategory(
      {
        id: 'equation-machines',
        number: 3,
        title: 'Equation Machines',
        subtitle: 'Inputs, outputs, transformations, and operators',
        icon: 'ƒ',
        accent: '#9DA8FF'
      },
      generateEquationMachine
    ),
    buildCategory(
      {
        id: 'grid-logic',
        number: 4,
        title: 'Grid Logic',
        subtitle: 'Rows, columns, and connected cell rules',
        icon: '▦',
        accent: '#62D68B'
      },
      generateGridLogic
    ),
    buildCategory(
      {
        id: 'number-rings',
        number: 5,
        title: 'Number Rings',
        subtitle: 'Opposite pairs and circular transformations',
        icon: '◉',
        accent: '#F09BC3'
      },
      generateNumberRing
    ),
    buildCategory(
      {
        id: 'logic-mix',
        number: 6,
        title: 'Logic Mix',
        subtitle: 'Symbols, balances, codes, and mixed reasoning',
        icon: '◇',
        accent: '#E89468'
      },
      generateLogicMix
    )
  ];
}
