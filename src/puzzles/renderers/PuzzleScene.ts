import * as THREE from 'three';
import { ThreeRenderer } from '../../core/ThreeRenderer';
import type {
  CountingPuzzleData,
  DiagramPuzzleData,
  GridPuzzleData,
  PuzzleDefinition,
  SequencePuzzleData
} from '../PuzzleTypes';

const ACCENT = '#4ED8CA';
const GOLD = '#F0BF59';
const MUTED = '#637184';
const NODE_BG = '#172132';
const NODE_TEXT = '#F8FBFF';

export class PuzzleScene {
  private readonly engine: ThreeRenderer;
  private readonly animated: THREE.Object3D[] = [];
  private successParticles: THREE.Points | null = null;
  private reducedMotion = false;

  constructor(host: HTMLElement) {
    this.engine = new ThreeRenderer(host);
    this.engine.setFrameHandler((elapsed) => this.animate(elapsed));
    this.engine.start();
  }

  render(puzzle: PuzzleDefinition, reducedMotion = false): void {
    this.reducedMotion = reducedMotion;
    this.engine.clear();
    this.animated.length = 0;
    this.successParticles = null;

    switch (puzzle.puzzleData.kind) {
      case 'sequence':
        this.renderSequence(puzzle.puzzleData);
        break;
      case 'grid':
        this.renderGrid(puzzle.puzzleData);
        break;
      case 'counting':
        this.renderCounting(puzzle.puzzleData);
        break;
      case 'diagram':
        this.renderDiagram(puzzle.puzzleData);
        break;
    }
  }

  celebrate(): void {
    if (this.reducedMotion) return;
    const count = 64;
    const positions = new Float32Array(count * 3);
    for (let index = 0; index < count; index += 1) {
      positions[index * 3] = (Math.random() - 0.5) * 0.7;
      positions[index * 3 + 1] = (Math.random() - 0.5) * 0.7;
      positions[index * 3 + 2] = 0.1;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({ color: ACCENT, size: 0.12, transparent: true, opacity: 1 });
    this.successParticles = new THREE.Points(geometry, material);
    this.engine.scene.add(this.successParticles);
  }

  dispose(): void {
    this.engine.dispose();
  }

  private renderSequence(data: SequencePuzzleData): void {
    const rows = data.rows ?? [data.values];
    rows.forEach((row, rowIndex) => {
      const gap = Math.min(1.35, 7.4 / Math.max(row.length, 1));
      const startX = -((row.length - 1) * gap) / 2;
      const y = (rows.length - 1) * 0.9 - rowIndex * 1.8;
      row.forEach((value, index) => {
        const sprite = this.nodeSprite(value === null ? '?' : String(value), value === null);
        sprite.position.set(startX + index * gap, y, 0);
        this.engine.scene.add(sprite);
        this.animated.push(sprite);
        if (index < row.length - 1) {
          this.addLine([startX + index * gap + 0.5, y], [startX + (index + 1) * gap - 0.5, y], MUTED);
        }
      });
    });
  }

  private renderGrid(data: GridPuzzleData): void {
    const rows = data.cells.length;
    const columns = Math.max(...data.cells.map((row) => row.length));
    const cell = Math.min(1.25, 5.2 / Math.max(rows, columns));
    const width = columns * cell;
    const height = rows * cell;
    const left = -width / 2;
    const top = height / 2;

    for (let row = 0; row <= rows; row += 1) {
      this.addLine([left, top - row * cell], [left + width, top - row * cell], MUTED, 0.028);
    }
    for (let column = 0; column <= columns; column += 1) {
      this.addLine([left + column * cell, top], [left + column * cell, top - height], MUTED, 0.028);
    }

    data.cells.forEach((row, rowIndex) => {
      row.forEach((value, columnIndex) => {
        const sprite = this.nodeSprite(value === null ? '?' : String(value), value === null, 0.62);
        sprite.position.set(left + (columnIndex + 0.5) * cell, top - (rowIndex + 0.5) * cell, 0);
        this.engine.scene.add(sprite);
      });
    });
  }

  private renderCounting(data: CountingPuzzleData): void {
    const size = 4.5;
    const cell = size / data.gridSize;
    const left = -size / 2;
    const top = size / 2;

    for (let index = 0; index <= data.gridSize; index += 1) {
      this.addLine([left, top - index * cell], [left + size, top - index * cell], ACCENT, 0.04);
      this.addLine([left + index * cell, top], [left + index * cell, top - size], ACCENT, 0.04);
    }
    if (data.includeDiagonals) {
      this.addLine([left, top], [left + size, top - size], GOLD, 0.05);
      this.addLine([left + size, top], [left, top - size], GOLD, 0.05);
    }
  }

  private renderDiagram(data: DiagramPuzzleData): void {
    data.lines?.forEach((line) => this.addLine(line.from, line.to, line.dashed ? GOLD : MUTED));
    data.circles?.forEach((circle) => {
      const curve = new THREE.EllipseCurve(circle.x, circle.y, circle.radius, circle.radius, 0, Math.PI * 2);
      const points = curve.getPoints(96).map((point) => new THREE.Vector3(point.x, point.y, 0));
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      this.engine.scene.add(new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: MUTED, transparent: true, opacity: 0.88 })));
    });
    data.rects?.forEach((rect) => {
      const x = rect.x - rect.width / 2;
      const y = rect.y + rect.height / 2;
      this.addLine([x, y], [x + rect.width, y], MUTED);
      this.addLine([x + rect.width, y], [x + rect.width, y - rect.height], MUTED);
      this.addLine([x + rect.width, y - rect.height], [x, y - rect.height], MUTED);
      this.addLine([x, y - rect.height], [x, y], MUTED);
    });
    data.labels.forEach((label) => {
      const isMissing = label.style === 'missing';
      const isBoxed = label.style === 'node' || isMissing;
      const sprite = this.engine.createTextSprite(label.text, {
        color: isMissing ? GOLD : NODE_TEXT,
        background: isBoxed ? NODE_BG : undefined,
        border: isMissing ? GOLD : label.style === 'node' ? ACCENT : undefined,
        fontSize: label.style === 'small' ? 42 : isBoxed ? 60 : 58,
        fontWeight: isBoxed ? 850 : 700,
        padding: isBoxed ? 0 : 20,
        boxWidth: isBoxed ? 118 : undefined,
        boxHeight: isBoxed ? 96 : undefined,
        scale: label.style === 'small' ? 0.58 : label.style === 'symbol' ? 0.78 : isBoxed ? 0.68 : 0.76
      });
      sprite.position.set(label.x, label.y, 0.02);
      this.engine.scene.add(sprite);
      if (isMissing) this.animated.push(sprite);
    });
  }

  private nodeSprite(text: string, missing: boolean, scale = 0.68): THREE.Sprite {
    return this.engine.createTextSprite(text, {
      color: missing ? GOLD : NODE_TEXT,
      background: NODE_BG,
      border: missing ? GOLD : ACCENT,
      fontSize: 60,
      fontWeight: 850,
      padding: 0,
      boxWidth: 118,
      boxHeight: 96,
      scale
    });
  }

  private addLine(
    from: [number, number],
    to: [number, number],
    color: string,
    width = 0.03
  ): void {
    const start = new THREE.Vector2(...from);
    const end = new THREE.Vector2(...to);
    const delta = end.clone().sub(start);
    const length = delta.length();
    const geometry = new THREE.PlaneGeometry(length, width);
    const material = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.82 });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set((from[0] + to[0]) / 2, (from[1] + to[1]) / 2, -0.02);
    mesh.rotation.z = Math.atan2(delta.y, delta.x);
    this.engine.scene.add(mesh);
  }

  private animate(elapsed: number): void {
    if (!this.reducedMotion) {
      this.animated.forEach((object, index) => {
        const pulse = 1 + Math.sin(elapsed * 2.4 + index) * 0.035;
        object.scale.multiplyScalar(pulse / (object.userData.lastPulse ?? 1));
        object.userData.lastPulse = pulse;
      });
    }

    if (this.successParticles) {
      const position = this.successParticles.geometry.getAttribute('position') as THREE.BufferAttribute;
      for (let index = 0; index < position.count; index += 1) {
        const x = position.getX(index);
        const y = position.getY(index);
        const length = Math.max(Math.hypot(x, y), 0.02);
        position.setXY(index, x + (x / length) * 0.025, y + (y / length) * 0.025);
      }
      position.needsUpdate = true;
      const material = this.successParticles.material as THREE.PointsMaterial;
      material.opacity *= 0.97;
      if (material.opacity < 0.03) {
        this.engine.scene.remove(this.successParticles);
        this.successParticles.geometry.dispose();
        material.dispose();
        this.successParticles = null;
      }
    }
  }
}
