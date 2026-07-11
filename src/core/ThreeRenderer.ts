import * as THREE from 'three';

export interface TextSpriteOptions {
  color?: string;
  background?: string;
  border?: string;
  fontSize?: number;
  fontWeight?: number;
  padding?: number;
  scale?: number;
  boxWidth?: number;
  boxHeight?: number;
}

export class ThreeRenderer {
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.OrthographicCamera(-4.5, 4.5, 3.4, -3.4, 0.1, 100);
  readonly renderer: THREE.WebGLRenderer;
  private frameId: number | null = null;
  private readonly clock = new THREE.Clock();
  private onFrame: ((elapsed: number) => void) | null = null;
  private resizeObserver: ResizeObserver | null = null;

  constructor(private readonly host: HTMLElement) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.camera.position.z = 10;
    this.host.append(this.renderer.domElement);
    this.renderer.domElement.setAttribute('aria-hidden', 'true');

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(this.host);
    this.resize();
  }

  setFrameHandler(handler: ((elapsed: number) => void) | null): void {
    this.onFrame = handler;
  }

  start(): void {
    if (this.frameId !== null) return;
    this.clock.start();
    const loop = (): void => {
      this.frameId = requestAnimationFrame(loop);
      this.onFrame?.(this.clock.getElapsedTime());
      this.renderer.render(this.scene, this.camera);
    };
    loop();
  }

  stop(): void {
    if (this.frameId !== null) cancelAnimationFrame(this.frameId);
    this.frameId = null;
  }

  resize(): void {
    const width = Math.max(this.host.clientWidth, 1);
    const height = Math.max(this.host.clientHeight, 1);
    const aspect = width / height;
    const vertical = 3.4;
    this.camera.left = -vertical * aspect;
    this.camera.right = vertical * aspect;
    this.camera.top = vertical;
    this.camera.bottom = -vertical;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  }

  clear(): void {
    while (this.scene.children.length) {
      const child = this.scene.children.pop();
      if (!child) continue;
      child.traverse((object) => {
        const mesh = object as THREE.Mesh;
        mesh.geometry?.dispose();
        const material = mesh.material;
        if (Array.isArray(material)) material.forEach((item) => item.dispose());
        else material?.dispose();
        if (material && !Array.isArray(material) && 'map' in material) {
          (material.map as THREE.Texture | null)?.dispose();
        }
      });
    }
  }

  createTextSprite(text: string, options: TextSpriteOptions = {}): THREE.Sprite {
    const fontSize = options.fontSize ?? 62;
    const fontWeight = options.fontWeight ?? 750;
    const padding = options.padding ?? 24;
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas 2D context is unavailable.');

    context.font = `${fontWeight} ${fontSize}px Inter, system-ui, sans-serif`;
    const metrics = context.measureText(text);
    canvas.width = options.boxWidth ?? Math.ceil(metrics.width + padding * 2);
    canvas.height = options.boxHeight ?? Math.ceil(fontSize * 1.55 + padding * 2);
    context.font = `${fontWeight} ${fontSize}px Inter, system-ui, sans-serif`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';

    if (options.background) {
      context.fillStyle = options.background;
      roundRect(context, 3, 3, canvas.width - 6, canvas.height - 6, Math.min(24, canvas.height * 0.28));
      context.fill();
    }
    if (options.border) {
      context.strokeStyle = options.border;
      context.lineWidth = 5;
      roundRect(context, 4, 4, canvas.width - 8, canvas.height - 8, Math.min(24, canvas.height * 0.28));
      context.stroke();
    }

    context.fillStyle = options.color ?? '#F6F7F9';
    context.fillText(text, canvas.width / 2, canvas.height / 2 + 2);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(material);
    const scale = options.scale ?? 1;
    const ratio = canvas.width / canvas.height;
    sprite.scale.set(ratio * scale, scale, 1);
    return sprite;
  }

  dispose(): void {
    this.stop();
    this.resizeObserver?.disconnect();
    this.clear();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}

function roundRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
): void {
  const r = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + r, y);
  context.arcTo(x + width, y, x + width, y + height, r);
  context.arcTo(x + width, y + height, x, y + height, r);
  context.arcTo(x, y + height, x, y, r);
  context.arcTo(x, y, x + width, y, r);
  context.closePath();
}
