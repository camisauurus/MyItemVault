const Sounds = {
  _ctx: null,

  _getCtx() {
    if (!this._ctx) {
      const Ctor = window.AudioContext || window.webkitAudioContext;
      if (!Ctor) return null;
      this._ctx = new Ctor();
    }
    if (this._ctx.state === 'suspended') {
      this._ctx.resume();
    }
    return this._ctx;
  },

  _play(freq, duration, type, volume, freqEnd) {
    const ctx = this._getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type || 'square';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      if (freqEnd) {
        osc.frequency.exponentialRampToValueAtTime(freqEnd, ctx.currentTime + duration);
      }
      gain.gain.setValueAtTime(volume || 0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {}
  },

  drop() {
    const ctx = this._getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.35);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);

      setTimeout(() => {
        if (!this._ctx) return;
        const osc2 = this._ctx.createOscillator();
        const gain2 = this._ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(1320, this._ctx.currentTime);
        gain2.gain.setValueAtTime(0.08, this._ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.001, this._ctx.currentTime + 0.18);
        osc2.connect(gain2);
        gain2.connect(this._ctx.destination);
        osc2.start();
        osc2.stop(this._ctx.currentTime + 0.18);
      }, 180);
    } catch {}
  },

  delete() {
    this._play(600, 0.18, 'sawtooth', 0.08, 100);
  },

  click() {
    this._play(1000, 0.05, 'square', 0.06);
  },

  error() {
    this._play(120, 0.3, 'sawtooth', 0.1);
  },
};
