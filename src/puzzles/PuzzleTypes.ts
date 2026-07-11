export type PuzzleType =
  | 'sequence'
  | 'alternating-sequence'
  | 'triangle'
  | 'shape-code'
  | 'equation'
  | 'input-output'
  | 'grid'
  | 'counting'
  | 'ring'
  | 'balance'
  | 'symbol-value'
  | 'missing-operator'
  | 'multiple-choice'
  | 'drag-and-drop';

export type AnswerMode =
  | 'numeric-input'
  | 'multiple-choice'
  | 'drag-and-drop'
  | 'operator-selection';

export interface PuzzleHint {
  text: string;
  level: 1 | 2 | 3;
}

export interface DiagramLabel {
  text: string;
  x: number;
  y: number;
  style?: 'plain' | 'node' | 'missing' | 'symbol' | 'small';
}

export interface DiagramLine {
  from: [number, number];
  to: [number, number];
  dashed?: boolean;
}

export interface DiagramCircle {
  x: number;
  y: number;
  radius: number;
}

export interface DiagramRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SequencePuzzleData {
  kind: 'sequence';
  values: Array<number | string | null>;
  rows?: Array<Array<number | string | null>>;
}

export interface DiagramPuzzleData {
  kind: 'diagram';
  labels: DiagramLabel[];
  lines?: DiagramLine[];
  circles?: DiagramCircle[];
  rects?: DiagramRect[];
}

export interface GridPuzzleData {
  kind: 'grid';
  cells: Array<Array<number | string | null>>;
  highlightDiagonal?: boolean;
}

export interface CountingPuzzleData {
  kind: 'counting';
  gridSize: 2 | 3 | 4;
  includeDiagonals?: boolean;
  promptShape: 'squares' | 'triangles';
}

export type PuzzleData =
  | SequencePuzzleData
  | DiagramPuzzleData
  | GridPuzzleData
  | CountingPuzzleData;

export interface PuzzleDefinition {
  id: string;
  chapterId: string;
  levelNumber: number;
  title: string;
  type: PuzzleType;
  prompt: string;
  answerMode: AnswerMode;
  difficulty: 1 | 2 | 3 | 4 | 5;
  puzzleData: PuzzleData;
  correctAnswers: Array<string | number>;
  choices?: Array<string | number>;
  explanation: string;
  solutionSteps: string[];
  hints: [PuzzleHint, PuzzleHint, PuzzleHint];
  allowNegative?: boolean;
  allowDecimal?: boolean;
  numericTolerance?: number;
}

export interface ChapterDefinition {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  icon: string;
  accent: string;
  puzzles: PuzzleDefinition[];
}
