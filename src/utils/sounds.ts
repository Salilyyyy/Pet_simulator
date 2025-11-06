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

    // Try to load external music file first
    try {
      this.backgroundMusic = new Audio('/background-music.mp3');
      this.backgroundMusic.loop = true;
      this.backgroundMusic.volume = 0.3;

      await this.backgroundMusic.play();
      this.isBackgroundPlaying = true;
      console.log('✅ Background music loaded from file!');
      return;
    } catch (error) {
      console.log('📁 No music file found, generating chill background music...');
    }

    // Fallback: Generate chill background music using Web Audio API
    const context = this.initAudioContext();
    if (!context) throw new Error('Audio context not available');

    // Create a more musical, chill background composition
    const gainNode = context.createGain();
    gainNode.connect(context.destination);
    gainNode.gain.setValueAtTime(0.15, context.currentTime);

    // Main melody - soft piano-like notes
    const melodyNotes = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88]; // C4 to B4
    let noteIndex = 0;

    const playNextNote = () => {
      if (!this.isBackgroundPlaying) return;

      const oscillator = context.createOscillator();
      const noteGain = context.createGain();

      oscillator.connect(noteGain);
      noteGain.connect(gainNode);

      // Soft attack and release for natural sound
      const currentNote = melodyNotes[noteIndex % melodyNotes.length];
      oscillator.frequency.setValueAtTime(currentNote, context.currentTime);

      // Piano-like sound with triangle wave
      oscillator.type = 'triangle';

      noteGain.gain.setValueAtTime(0, context.currentTime);
      noteGain.gain.linearRampToValueAtTime(0.1, context.currentTime + 0.1);
      noteGain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 2);

      oscillator.start(context.currentTime);
      oscillator.stop(context.currentTime + 2);

      noteIndex++;
      // Play next note after 1.5 seconds for overlapping, chill effect
      setTimeout(playNextNote, 1500);
    };

    // Add ambient pads for depth
    const createAmbientPad = (frequency: number, delay: number) => {
      setTimeout(() => {
        if (!this.isBackgroundPlaying) return;

        const oscillator = context.createOscillator();
        const padGain = context.createGain();

        oscillator.connect(padGain);
        padGain.connect(gainNode);

        oscillator.frequency.setValueAtTime(frequency, context.currentTime);
        oscillator.type = 'sine';

        padGain.gain.setValueAtTime(0, context.currentTime);
        padGain.gain.linearRampToValueAtTime(0.05, context.currentTime + 2);
        // Slow fade for ambient feel
        padGain.gain.exponentialRampToValueAtTime(0.02, context.currentTime + 8);

        oscillator.start(context.currentTime);
        oscillator.stop(context.currentTime + 8);
      }, delay);
    };

    // Start the ambient pads
    createAmbientPad(130.81, 0); // C3
    createAmbientPad(164.81, 1000); // E3
    createAmbientPad(196.00, 2000); // G3

    // Start the melody
    playNextNote();

    this.isBackgroundPlaying = true;
    console.log('🎵 Chill background music started! Add background-music.mp3 to public/ for real music.');
  }

  stopBackgroundMusic(): void {
    if (!this.isBackgroundPlaying) return;

    // Stop HTML5 Audio if it exists
    if (this.backgroundMusic) {
      this.backgroundMusic.pause();
      this.backgroundMusic.currentTime = 0;
      this.backgroundMusic = null;
    }

    // For generated music, just set the flag (oscillators will stop themselves)
    this.isBackgroundPlaying = false;
    console.log('🎵 Background music stopped');
  }

  isBackgroundMusicPlaying(): boolean {
    return this.isBackgroundPlaying;
  }
}

export const soundManager = new SoundManager();
