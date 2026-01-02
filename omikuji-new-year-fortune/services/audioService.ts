
class AudioService {
  private ctx: AudioContext | null = null;
  private isEnabled: boolean = true;
  private celebrationOscillators: { osc: OscillatorNode; gain: GainNode }[] = [];

  private initContext() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    if (!enabled) this.stopCelebrationMusic();
  }

  /**
   * Synthesizes the authentic 'Huala-huala' sound of an Omikuji shaker.
   */
  public playShakeSound() {
    if (!this.isEnabled) return;
    this.initContext();
    const ctx = this.ctx!;
    const now = ctx.currentTime;

    const bufferSize = ctx.sampleRate * 0.4;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1;

    const playBurst = (startTime: number, intensity: number) => {
      const stickCount = 45;
      for (let i = 0; i < stickCount; i++) {
        const offset = Math.random() * 0.15;
        const t = startTime + offset;
        const dur = 0.003 + Math.random() * 0.012;
        
        const source = ctx.createBufferSource();
        source.buffer = noiseBuffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        const freq = 1200 + Math.random() * 2500;
        filter.frequency.setValueAtTime(freq, t);
        filter.Q.setValueAtTime(25, t);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.18 * intensity, t + 0.001);
        gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

        source.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        source.start(t);
        source.stop(t + dur);
      }

      const bodySource = ctx.createBufferSource();
      bodySource.buffer = noiseBuffer;
      const bodyFilter = ctx.createBiquadFilter();
      bodyFilter.type = 'bandpass';
      bodyFilter.frequency.setValueAtTime(180, startTime);
      bodyFilter.Q.setValueAtTime(1.5, startTime);
      
      const bodyGain = ctx.createGain();
      bodyGain.gain.setValueAtTime(0, startTime);
      bodyGain.gain.linearRampToValueAtTime(0.12 * intensity, startTime + 0.04);
      bodyGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);

      bodySource.connect(bodyFilter);
      bodyFilter.connect(bodyGain);
      bodyGain.connect(ctx.destination);
      bodySource.start(startTime);
      bodySource.stop(startTime + 0.25);

      const frictionSource = ctx.createBufferSource();
      frictionSource.buffer = noiseBuffer;
      const frictionFilter = ctx.createBiquadFilter();
      frictionFilter.type = 'highpass';
      frictionFilter.frequency.setValueAtTime(4500, startTime);
      
      const frictionGain = ctx.createGain();
      frictionGain.gain.setValueAtTime(0, startTime);
      frictionGain.gain.linearRampToValueAtTime(0.03 * intensity, startTime + 0.05);
      frictionGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.2);

      frictionSource.connect(frictionFilter);
      frictionFilter.connect(frictionGain);
      frictionGain.connect(ctx.destination);
      frictionSource.start(startTime);
      frictionSource.stop(startTime + 0.2);
    };

    playBurst(now, 1.0);
    playBurst(now + 0.22, 0.75);
    playBurst(now + 0.45, 0.5);
  }

  /**
   * Cheerful jingle for when the stick is revealed
   */
  public playRevealSound() {
    if (!this.isEnabled) return;
    this.initContext();
    const ctx = this.ctx!;
    const now = ctx.currentTime;

    // High, bright notes: G5 -> C6
    const notes = [783.99, 1046.50];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.15);
      
      gain.gain.setValueAtTime(0, now + i * 0.15);
      gain.gain.linearRampToValueAtTime(0.15, now + i * 0.15 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.3);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.15);
      osc.stop(now + i * 0.15 + 0.4);
    });
  }

  public playSuccessSound() {
    if (!this.isEnabled) return;
    this.initContext();
    const ctx = this.ctx!;
    const now = ctx.currentTime;

    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.1);
      gain.gain.setValueAtTime(0.1, now + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.1);
      osc.stop(now + i * 0.1 + 0.5);
    });
  }

  public playCelebrationMusic() {
    if (!this.isEnabled) return;
    this.initContext();
    const ctx = this.ctx!;
    const now = ctx.currentTime;

    const melody = [
      { f: 523.25, d: 0.3 }, { f: 587.33, d: 0.3 }, { f: 659.25, d: 0.3 },
      { f: 783.99, d: 0.6 }, { f: 880.00, d: 0.3 }, { f: 783.99, d: 0.3 },
      { f: 659.25, d: 0.6 },
    ];

    let timeOffset = 0;
    melody.forEach((note) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.f, now + timeOffset);
      gain.gain.setValueAtTime(0, now + timeOffset);
      gain.gain.linearRampToValueAtTime(0.08, now + timeOffset + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + timeOffset + note.d);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + timeOffset);
      osc.stop(now + timeOffset + note.d);
      this.celebrationOscillators.push({ osc, gain });
      timeOffset += note.d;
    });
  }

  public stopCelebrationMusic() {
    this.celebrationOscillators.forEach(({ osc }) => {
      try { osc.stop(); } catch(e) {}
    });
    this.celebrationOscillators = [];
  }
}

export const audioService = new AudioService();
