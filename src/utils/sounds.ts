class SoundManager {
  private audioContext: AudioContext | null = null;
  private backgroundMusic: HTMLAudioElement | null = null;
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

  async startBackgroundMusic(): Promise<void> {
    if (this.isBackgroundPlaying) return;

    this.backgroundMusic = new Audio('/background-music.mp3');
    this.backgroundMusic.loop = true;
    this.backgroundMusic.volume = 0.3;

    this.backgroundMusic.addEventListener('error', () => {
      console.log('Background music file not found. Add background-music.mp3 to the public folder.');
      this.isBackgroundPlaying = false;
    });

    try {
      await this.backgroundMusic.play();
      this.isBackgroundPlaying = true;
    } catch (error: any) {
      if (error.name === 'NotAllowedError') {
        console.log('Background music requires user interaction to start');
      } else if (error.name === 'NotSupportedError') {
        console.log('Background music file format not supported');
      } else {
        console.log('Error playing background music:', error);
      }
      this.isBackgroundPlaying = false;
      throw error;
    }
  }

  stopBackgroundMusic(): void {
    if (!this.isBackgroundPlaying || !this.backgroundMusic) return;

    this.backgroundMusic.pause();
    this.backgroundMusic.currentTime = 0;
    this.backgroundMusic = null;
    this.isBackgroundPlaying = false;
  }

  isBackgroundMusicPlaying(): boolean {
    return this.isBackgroundPlaying;
  }
}

export const soundManager = new SoundManager();
