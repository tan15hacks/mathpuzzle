export type SoundName =
  | 'tap'
  | 'key'
  | 'correct'
  | 'incorrect'
  | 'hint'
  | 'unlock'
  | 'chapter';

interface Tone {
  frequencies: number[];
  duration: number;
  type: OscillatorType;
  gain: number;
}

const tones: Record<SoundName, Tone> = {
  tap: { frequencies: [260], duration: 0.045, type: 'sine', gain: 0.03 },
  key: { frequencies: [340], duration: 0.035, type: 'sine', gain: 0.025 },
  correct: { frequencies: [440, 554, 659], duration: 0.12, type: 'sine', gain: 0.055 },
  incorrect: { frequencies: [180, 140], duration: 0.11, type: 'triangle', gain: 0.045 },
  hint: { frequencies: [523, 659], duration: 0.1, type: 'sine', gain: 0.04 },
  unlock: { frequencies: [392, 523, 659], duration: 0.1, type: 'triangle', gain: 0.045 },
  chapter: { frequencies: [392, 494, 587, 784], duration: 0.13, type: 'sine', gain: 0.05 }
};

export class AudioManager {
  private context: AudioContext | null = null;
  private volume = 0.8;
  private musicVolume = 0;
  private musicOscillators: OscillatorNode[] = [];
  private musicGain: GainNode | null = null;

  setVolume(volume: number): void {
    this.volume = Math.min(1, Math.max(0, volume));
  }

  setMusicVolume(volume: number): void {
    this.musicVolume = Math.min(1, Math.max(0, volume));
    if (this.musicVolume <= 0) {
      this.stopMusic();
      return;
    }
    void this.startMusic();
    if (this.musicGain && this.context) {
      this.musicGain.gain.setTargetAtTime(this.musicVolume * 0.018, this.context.currentTime, 0.08);
    }
  }

  private async startMusic(): Promise<void> {
    await this.unlock();
    const context = this.context;
    if (!context || this.musicOscillators.length > 0 || this.musicVolume <= 0) return;
    const gain = context.createGain();
    gain.gain.value = this.musicVolume * 0.018;
    gain.connect(context.destination);
    this.musicGain = gain;
    for (const frequency of [110, 164.81, 220]) {
      const oscillator = context.createOscillator();
      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;
      oscillator.connect(gain);
      oscillator.start();
      this.musicOscillators.push(oscillator);
    }
  }

  private stopMusic(): void {
    for (const oscillator of this.musicOscillators) oscillator.stop();
    this.musicOscillators = [];
    this.musicGain?.disconnect();
    this.musicGain = null;
  }

  async unlock(): Promise<void> {
    if (!this.context) this.context = new AudioContext();
    if (this.context.state === 'suspended') await this.context.resume();
  }

  play(name: SoundName): void {
    if (this.volume <= 0) return;
    void this.unlock().then(() => {
      const context = this.context;
      if (!context) return;
      const tone = tones[name];
      const now = context.currentTime;
      tone.frequencies.forEach((frequency, index) => {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        const start = now + index * tone.duration * 0.72;
        oscillator.type = tone.type;
        oscillator.frequency.setValueAtTime(frequency, start);
        gain.gain.setValueAtTime(tone.gain * this.volume, start);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + tone.duration);
        oscillator.connect(gain).connect(context.destination);
        oscillator.start(start);
        oscillator.stop(start + tone.duration + 0.02);
      });
    });
  }
}
