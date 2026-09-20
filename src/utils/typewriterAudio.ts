/**
 * Typewriter & Calligraphy Web Audio Synthesizer
 * Generates realistic mechanical typewriter keystrokes, spacebar clunks,
 * carriage return bell chimes, and delicate calligraphy pen-on-paper sounds
 * using native Web Audio API oscillators, noise buffers, and bandpass filters.
 */

class AudioSynthesizer {
  private ctx: AudioContext | null = null;
  private isEnabled: boolean = true;
  private masterVolume: number = 0.8;
  private lastCharIndexByLayer: Map<string, number> = new Map();

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  public getEnabled(): boolean {
    return this.isEnabled;
  }

  public setVolume(vol: number) {
    this.masterVolume = Math.max(0, Math.min(1, vol));
  }

  public getVolume(): number {
    return this.masterVolume;
  }

  public resetTracking() {
    this.lastCharIndexByLayer.clear();
  }

  /**
   * Play realistic typewriter keystroke click
   */
  public playKeyClick(isSpace: boolean = false, volumeMultiplier: number = 1.0) {
    if (!this.isEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const finalVolume = this.masterVolume * volumeMultiplier * 0.4;

      // 1. Sharp mechanical transient click (white noise burst through high Q bandpass)
      const bufferSize = Math.floor(ctx.sampleRate * 0.018); // 18ms
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;

      // Filter: spacebar is deeper (~350Hz), regular keys are crisper (~2600Hz + random pitch variation)
      const bandpass = ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      const jitter = (Math.random() - 0.5) * 400;
      bandpass.frequency.setValueAtTime(isSpace ? 360 + jitter * 0.2 : 2600 + jitter, now);
      bandpass.Q.setValueAtTime(isSpace ? 3.0 : 4.5, now);

      const clickGain = ctx.createGain();
      clickGain.gain.setValueAtTime(finalVolume * (isSpace ? 0.7 : 1.0), now);
      clickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.02);

      noiseSource.connect(bandpass);
      bandpass.connect(clickGain);
      clickGain.connect(ctx.destination);

      noiseSource.start(now);
      noiseSource.stop(now + 0.022);

      // 2. Mechanical body thud (resonant pitch-decayed body sine wave)
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();

      const baseFreq = isSpace ? 180 + Math.random() * 20 : 380 + Math.random() * 60;
      osc.type = isSpace ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.035);

      oscGain.gain.setValueAtTime(finalVolume * 0.8, now);
      oscGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

      osc.connect(oscGain);
      oscGain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.045);
    } catch {
      // Ignore audio synthesis errors on locked audio devices
    }
  }

  /**
   * Play carriage return bell ("Ding!")
   */
  public playBell(volumeMultiplier: number = 1.0) {
    if (!this.isEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const finalVolume = this.masterVolume * volumeMultiplier * 0.35;

      // Authentic two-tone brass bell chime (fundamental ~2093Hz C7 + overtone ~3136Hz G7)
      const bellFreqs = [2093, 3136, 4186];
      const bellAmps = [1.0, 0.45, 0.2];

      bellFreqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        const amp = finalVolume * bellAmps[idx];
        gain.gain.setValueAtTime(amp, now);
        // Exponential decay of bell shimmer
        gain.gain.exponentialRampToValueAtTime(0.0001, now + (idx === 0 ? 1.2 : 0.8));

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 1.25);
      });
    } catch {
      // Ignore
    }
  }

  /**
   * Play backspace clack for letter-by-letter erase
   */
  public playBackspace(volumeMultiplier: number = 1.0) {
    if (!this.isEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const finalVolume = this.masterVolume * volumeMultiplier * 0.35;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.025);

      gain.gain.setValueAtTime(finalVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.035);
    } catch {
      // Ignore
    }
  }

  /**
   * Play fountain pen nib scratch on parchment for calligraphy
   */
  public playPenScratch(volumeMultiplier: number = 1.0) {
    if (!this.isEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const finalVolume = this.masterVolume * volumeMultiplier * 0.18;

      const bufferSize = Math.floor(ctx.sampleRate * 0.04);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.5;
      }

      const source = ctx.createBufferSource();
      source.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1800 + Math.random() * 500, now);
      filter.Q.setValueAtTime(2.5, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(finalVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

      source.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      source.start(now);
      source.stop(now + 0.045);
    } catch {
      // Ignore
    }
  }

  /**
   * Checks if a new character was typed or deleted and triggers synchronized audio
   */
  public handleTypewriterStep(
    layerId: string,
    currentCharIndex: number,
    totalLength: number,
    text: string,
    isTyping: boolean,
    isErasing: boolean
  ) {
    if (!this.isEnabled) return;
    const prevIndex = this.lastCharIndexByLayer.get(layerId) ?? -1;

    if (isTyping && currentCharIndex > prevIndex) {
      // New character(s) appeared
      const char = text[currentCharIndex - 1] || '';
      const isSpace = char === ' ';
      const isNewline = char === '\n';
      const isLastChar = currentCharIndex === totalLength && totalLength > 1;

      if (isNewline || isLastChar) {
        this.playBell();
      } else {
        this.playKeyClick(isSpace);
      }
      this.lastCharIndexByLayer.set(layerId, currentCharIndex);
    } else if (isErasing && currentCharIndex < prevIndex) {
      // Character was deleted
      this.playBackspace();
      this.lastCharIndexByLayer.set(layerId, currentCharIndex);
    } else if (Math.abs(currentCharIndex - prevIndex) > 5) {
      // User jumped / scrubbed timeline
      this.lastCharIndexByLayer.set(layerId, currentCharIndex);
    }
  }
}

export const typewriterAudio = new AudioSynthesizer();
