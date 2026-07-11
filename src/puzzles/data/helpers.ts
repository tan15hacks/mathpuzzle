import type {
  AnswerMode,
  DiagramPuzzleData,
  DifficultyBand,
  PuzzleDefinition,
  PuzzleHint,
  PuzzleType
} from '../PuzzleTypes';

export const hints = (a: string, b: string, c: string): [PuzzleHint, PuzzleHint, PuzzleHint] => [
  { level: 1, text: a },
  { level: 2, text: b },
  { level: 3, text: c }
];

interface BaseArgs {
  id: string;
  chapterId: string;
  levelNumber: number;
  title: string;
  type: PuzzleType;
  prompt: string;
  answerMode?: AnswerMode;
  difficulty: 1 | 2 | 3 | 4 | 5;
  difficultyBand?: DifficultyBand;
  signature?: string;
  answer: string | number | Array<string | number>;
  choices?: Array<string | number>;
  explanation: string;
  steps: string[];
  hints: [PuzzleHint, PuzzleHint, PuzzleHint];
  allowNegative?: boolean;
  allowDecimal?: boolean;
}

export const make = (args: BaseArgs, puzzleData: PuzzleDefinition['puzzleData']): PuzzleDefinition => ({
  id: args.id,
  chapterId: args.chapterId,
  levelNumber: args.levelNumber,
  title: args.title,
  type: args.type,
  prompt: args.prompt,
  answerMode: args.answerMode ?? 'numeric-input',
  difficulty: args.difficulty,
  difficultyBand: args.difficultyBand,
  signature: args.signature,
  puzzleData,
  correctAnswers: Array.isArray(args.answer) ? args.answer : [args.answer],
  choices: args.choices,
  explanation: args.explanation,
  solutionSteps: args.steps,
  hints: args.hints,
  allowNegative: args.allowNegative,
  allowDecimal: args.allowDecimal
});

export const sequence = (args: BaseArgs, values: Array<number | string | null>): PuzzleDefinition =>
  make(args, { kind: 'sequence', values });

export const grid = (args: BaseArgs, cells: Array<Array<number | string | null>>): PuzzleDefinition =>
  make(args, { kind: 'grid', cells });

export const diagram = (args: BaseArgs, data: DiagramPuzzleData): PuzzleDefinition => make(args, data);

export const equationDiagram = (lines: string[]): DiagramPuzzleData => ({
  kind: 'diagram',
  labels: lines.map((text, index) => ({
    text,
    x: 0,
    y: (lines.length - 1) * 0.65 - index * 1.3,
    style: text.includes('?') ? 'missing' : 'plain'
  }))
});

export const triangleGroups = (
  groups: Array<[number | string, number | string, number | string | null]>
): DiagramPuzzleData => {
  const labels: DiagramPuzzleData['labels'] = [];
  const lines: NonNullable<DiagramPuzzleData['lines']> = [];
  const xPositions = groups.length === 3 ? [-2.7, 0, 2.7] : [-1.5, 1.5];

  groups.forEach((group, index) => {
    const x = xPositions[index] ?? 0;
    labels.push(
      { text: String(group[0]), x: x - 0.65, y: 0.8, style: 'node' },
      { text: String(group[1]), x: x + 0.65, y: 0.8, style: 'node' },
      { text: group[2] === null ? '?' : String(group[2]), x, y: -0.8, style: group[2] === null ? 'missing' : 'node' }
    );
    lines.push(
      { from: [x - 0.52, 0.52], to: [x, -0.52] },
      { from: [x + 0.52, 0.52], to: [x, -0.52] },
      { from: [x - 0.45, 0.66], to: [x + 0.45, 0.66] }
    );
  });

  return { kind: 'diagram', labels, lines };
};

export const inputOutput = (pairs: Array<[number | string, number | string | null]>): DiagramPuzzleData => ({
  kind: 'diagram',
  labels: pairs.flatMap(([input, output], index) => {
    const y = (pairs.length - 1) * 0.75 - index * 1.5;
    return [
      { text: String(input), x: -1.9, y, style: 'node' as const },
      { text: '→', x: 0, y, style: 'symbol' as const },
      {
        text: output === null ? '?' : String(output),
        x: 1.9,
        y,
        style: output === null ? ('missing' as const) : ('node' as const)
      }
    ];
  })
});

export const ring = (values: Array<number | string | null>): DiagramPuzzleData => {
  const radius = 2.35;
  return {
    kind: 'diagram',
    circles: [{ x: 0, y: 0, radius: 1.65 }],
    labels: values.map((value, index) => {
      const angle = Math.PI / 2 - (index / values.length) * Math.PI * 2;
      return {
        text: value === null ? '?' : String(value),
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        style: value === null ? ('missing' as const) : ('node' as const)
      };
    }),
    lines: values.map((_, index) => {
      const angle = Math.PI / 2 - (index / values.length) * Math.PI * 2;
      return {
        from: [Math.cos(angle) * 0.4, Math.sin(angle) * 0.4] as [number, number],
        to: [Math.cos(angle) * 1.55, Math.sin(angle) * 1.55] as [number, number]
      };
    })
  };
};

export const symbolEquations = (lines: string[]): DiagramPuzzleData => equationDiagram(lines);
