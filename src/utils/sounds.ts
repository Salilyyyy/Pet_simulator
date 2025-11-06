class SoundManager {
  private audioContext: AudioContext | null = null;
  private backgroundMusic: OscillatorNode | null = null;
  private backgroundGain: GainNode | null = null;
  private isBackgroundPlaying: boolean = false;

  private initAudioContext() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.audioContext;
  }

  private createBeep(frequency: number, duration: number, type: OscillatorType = 'sine'): void {
    const context = this.initAudioContext();
    if (!context) return;

    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    oscillator.frequency.setValueAtTime(frequency, context.currentTime);
    oscillator.type = type;

    gainNode.gain.setValueAtTime(0.3, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + duration);

    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + duration);
  }

  private createChime(): void {
    const context = this.initAudioContext();
    if (!context) return;

    const notes = [523.25, 659.25, 783.99];
    notes.forEach((freq, index) => {
      setTimeout(() => {
        this.createBeep(freq, 0.2, 'sine');
      }, index * 100);
    });
  }

  private createFailureSound(): void {
    const context = this.initAudioContext();
    if (!context) return;

    const notes = [440, 370, 311];
    notes.forEach((freq, index) => {
      setTimeout(() => {
        this.createBeep(freq, 0.15, 'sawtooth');
      }, index * 80);
    });
  }

  private createClickSound(): void {
    this.createBeep(800, 0.1, 'square');
  }

  private createVictorySound(): void {
    const context = this.initAudioContext();
    if (!context) return;

    const notes = [523.25, 587.33, 659.25, 698.46, 783.99];
    notes.forEach((freq, index) => {
      setTimeout(() => {
        this.createBeep(freq, 0.3, 'triangle');
      }, index * 150);
    });
  }

  playTileSelect(): void {
    this.createClickSound();
  }

  playMatchSuccess(): void {
    this.createChime();
  }

  playMatchFailure(): void {
    this.createFailureSound();
  }

  playGameStart(): void {
    this.createBeep(440, 0.2, 'sine');
    setTimeout(() => this.createBeep(554, 0.2, 'sine'), 100);
    setTimeout(() => this.createBeep(659, 0.3, 'sine'), 200);
  }

  playGameComplete(): void {
    this.createVictorySound();
  }

  playTimerWarning(): void {
    this.createBeep(1000, 0.1, 'square');
    setTimeout(() => this.createBeep(1000, 0.1, 'square'), 150);
    setTimeout(() => this.createBeep(1000, 0.1, 'square'), 300);
  }

  startBackgroundMusic(): void {
    if (this.isBackgroundPlaying) return;

    const context = this.initAudioContext();
    if (!context) return;

    this.backgroundGain = context.createGain();
    this.backgroundGain.connect(context.destination);
    this.backgroundGain.gain.setValueAtTime(0.1, context.currentTime);

    const oscillator1 = context.createOscillator();
    oscillator1.frequency.setValueAtTime(220, context.currentTime);
    oscillator1.type = 'sine';
    oscillator1.connect(this.backgroundGain);
    oscillator1.start();

    const oscillator2 = context.createOscillator();
    oscillator2.frequency.setValueAtTime(330, context.currentTime);
    oscillator2.type = 'sine';
    oscillator2.connect(this.backgroundGain);
    oscillator2.start();

    const oscillator3 = context.createOscillator();
    oscillator3.frequency.setValueAtTime(440, context.currentTime);
    oscillator3.type = 'triangle';
    oscillator3.connect(this.backgroundGain);
    oscillator3.start();

    const lfo = context.createOscillator();
    lfo.frequency.setValueAtTime(0.1, context.currentTime);
    const lfoGain = context.createGain();
    lfoGain.gain.setValueAtTime(10, context.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(oscillator1.frequency);
    lfo.start();

    this.backgroundMusic = oscillator1;
    this.isBackgroundPlaying = true;
  }

  stopBackgroundMusic(): void {
    if (!this.isBackgroundPlaying || !this.backgroundMusic) return;

    const context = this.initAudioContext();
    if (!context) return;

    if (this.backgroundGain) {
      this.backgroundGain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 1);
    }

    setTimeout(() => {
      if (this.backgroundMusic) {
        this.backgroundMusic.stop();
        this.backgroundMusic = null;
      }
      this.isBackgroundPlaying = false;
    }, 1000);
  }

  isBackgroundMusicPlaying(): boolean {
    return this.isBackgroundPlaying;
  }
}

export const soundManager = new SoundManager();
