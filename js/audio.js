/* ============================================
   Chiptune Audio Synthesizer
   Web Audio API - No external audio files
   ============================================ */

class ChiptuneAudio {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.isMuted = true;
    this.isInitialized = false;
    this.bgmInterval = null;
    this.bgmOscillators = [];
    this.bgmStep = 0;
  }

  init() {
    if (this.isInitialized) return;
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = this.isMuted ? 0 : 0.3;
    this.masterGain.connect(this.ctx.destination);
    this.isInitialized = true;
  }

  playTone(frequency, duration, waveType, volume = 0.3) {
    if (!this.isInitialized || this.isMuted) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = waveType || 'square';
    osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);

    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(this.ctx.currentTime);
    osc.stop(this.ctx.currentTime + duration);
  }

  playToneAtTime(frequency, startTime, duration, waveType, volume = 0.3) {
    if (!this.isInitialized || this.isMuted) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = waveType || 'square';
    osc.frequency.setValueAtTime(frequency, startTime);

    gain.gain.setValueAtTime(volume, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.01);
  }

  playNoise(duration, volume = 0.15) {
    if (!this.isInitialized || this.isMuted) return;

    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

    source.connect(gain);
    gain.connect(this.masterGain);
    source.start(this.ctx.currentTime);
  }

  sfxJump() {
    if (!this.isInitialized || this.isMuted) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(200, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, this.ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(this.ctx.currentTime);
    osc.stop(this.ctx.currentTime + 0.2);
  }

  sfxCoin() {
    if (!this.isInitialized || this.isMuted) return;
    const t = this.ctx.currentTime;
    this.playToneAtTime(987.77, t, 0.06, 'square', 0.2);
    this.playToneAtTime(1318.5, t + 0.06, 0.1, 'square', 0.2);
  }

  sfxHit() {
    if (!this.isInitialized || this.isMuted) return;
    this.playNoise(0.12, 0.2);
    this.playTone(100, 0.25, 'square', 0.15);
  }

  sfxPowerup() {
    if (!this.isInitialized || this.isMuted) return;
    const t = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => {
      this.playToneAtTime(freq, t + i * 0.08, 0.1, 'triangle', 0.25);
    });
  }

  sfxGameOver() {
    if (!this.isInitialized || this.isMuted) return;
    const t = this.ctx.currentTime;
    const notes = [392, 329.63, 261.63, 196];
    notes.forEach((freq, i) => {
      this.playToneAtTime(freq, t + i * 0.2, 0.25, 'square', 0.2 - i * 0.04);
    });
  }

  sfxLevelComplete() {
    if (!this.isInitialized || this.isMuted) return;
    const t = this.ctx.currentTime;
    const notes = [523.25, 587.33, 659.25, 698.46, 783.99, 880, 987.77, 1046.5];
    notes.forEach((freq, i) => {
      this.playToneAtTime(freq, t + i * 0.06, 0.08, 'triangle', 0.25);
    });
  }

  sfxStomp() {
    if (!this.isInitialized || this.isMuted) return;
    const t = this.ctx.currentTime;
    this.playToneAtTime(400, t, 0.05, 'square', 0.2);
    this.playToneAtTime(600, t + 0.05, 0.08, 'square', 0.15);
  }

  startBGM() {
    if (!this.isInitialized || this.bgmInterval) return;

    const bpm = 140;
    const beatDuration = 60 / bpm;
    const sixteenth = beatDuration / 4;

    // Simple melody in C major
    const melody = [
      523.25, 0, 659.25, 0, 783.99, 0, 659.25, 0,
      698.46, 0, 523.25, 0, 587.33, 0, 523.25, 0,
      783.99, 0, 880, 0, 783.99, 0, 659.25, 0,
      587.33, 0, 523.25, 0, 659.25, 0, 392, 0,
    ];

    // Bass line
    const bass = [
      130.81, 0, 0, 130.81, 0, 0, 130.81, 0,
      174.61, 0, 0, 174.61, 0, 0, 174.61, 0,
      196, 0, 0, 196, 0, 0, 196, 0,
      164.81, 0, 0, 164.81, 0, 0, 164.81, 0,
    ];

    this.bgmStep = 0;

    this.bgmInterval = setInterval(() => {
      if (this.isMuted) return;

      const idx = this.bgmStep % melody.length;

      if (melody[idx] > 0) {
        this.playTone(melody[idx], sixteenth * 0.9, 'square', 0.08);
      }

      if (bass[idx] > 0) {
        this.playTone(bass[idx], sixteenth * 0.9, 'triangle', 0.1);
      }

      this.bgmStep++;
    }, sixteenth * 1000);
  }

  stopBGM() {
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
      this.bgmStep = 0;
    }
  }

  toggleMute() {
    this.init();
    this.isMuted = !this.isMuted;
    if (this.masterGain) {
      this.masterGain.gain.value = this.isMuted ? 0 : 0.3;
    }
    return this.isMuted;
  }
}

// Global singleton
const chiptuneAudio = new ChiptuneAudio();
