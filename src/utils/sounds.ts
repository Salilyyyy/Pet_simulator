// Sound utility functions for the Pikachu matching game
// Using Web Audio API to generate simple sound effects

class SoundManager {
  private audioContext: AudioContext | null = null;

  constructor() {
    // Initialize audio context on first user interaction
  }

  private initAudioContext() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.audioContext;
  }

  // Generate a simple beep sound
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

  // Generate a success chime
  private createChime(): void {
    const context = this.initAudioContext();
    if (!context) return;

    // Play a sequence of notes
    const notes = [523.25, 659.25, 783.99]; // C, E, G
    notes.forEach((freq, index) => {
      setTimeout(() => {
        this.createBeep(freq, 0.2, 'sine');
      }, index * 100);
    });
  }

  // Generate a failure sound
  private createFailureSound(): void {
    const context = this.initAudioContext();
    if (!context) return;

    // Descending notes
    const notes = [440, 370, 311]; // A, F#, D#
    notes.forEach((freq, index) => {
      setTimeout(() => {
        this.createBeep(freq, 0.15, 'sawtooth');
      }, index * 80);
    });
  }

  // Generate a click sound
  private createClickSound(): void {
    this.createBeep(800, 0.1, 'square');
  }

  // Generate a victory fanfare
  private createVictorySound(): void {
    const context = this.initAudioContext();
    if (!context) return;

    const notes = [523.25, 587.33, 659.25, 698.46, 783.99]; // C, D, E, F, G
    notes.forEach((freq, index) => {
      setTimeout(() => {
        this.createBeep(freq, 0.3, 'triangle');
      }, index * 150);
    });
  }

  // Public methods to play sounds
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
    // Urgent beeping for low time
    this.createBeep(1000, 0.1, 'square');
    setTimeout(() => this.createBeep(1000, 0.1, 'square'), 150);
    setTimeout(() => this.createBeep(1000, 0.1, 'square'), 300);
  }
}

// Export a singleton instance
export const soundManager = new SoundManager();
