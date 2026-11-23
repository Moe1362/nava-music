// A tiny original music generator built on the Web Audio API.
// It gives every placeholder track its own short tune so the player has
// real sound without using any copyrighted recordings.

import type { Track } from "./data";

const SCALE = [0, 1, 4, 5, 7, 8, 10, 12]; // a Persian-flavoured mode (like Homayoun)

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const freq = (midi: number) => 440 * Math.pow(2, (midi - 69) / 12);

type Pattern = { root: number; melody: number[]; bass: number[] };

function pattern(track: Track): Pattern {
  const r = rng(hash(track.id));
  const root = 57 + Math.floor(r() * 7); // A3..D#4
  const melody: number[] = [];
  let step = 4;
  for (let i = 0; i < 32; i++) {
    step = Math.max(0, Math.min(SCALE.length - 1, step + Math.round((r() - 0.5) * 3)));
    melody.push(r() < 0.18 ? -1 : SCALE[step]); // -1 = rest
  }
  const bass = [0, 0, 5, 7].map((d) => (r() < 0.5 ? d : SCALE[Math.floor(r() * 5)]));
  return { root, melody, bass };
}

export class DemoSynth {
  private ctx: AudioContext | null = null;
  private bus: AudioNode | null = null;
  private out: GainNode | null = null;
  private timer: number | null = null;
  private nextStep = 0;
  private startAt = 0; // ctx time of step 0
  private stepLen = 0.25;
  private pat: Pattern | null = null;

  private ensure() {
    if (this.ctx) return this.ctx;
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new Ctor();
    const lp = this.ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 2400;
    lp.connect(this.ctx.destination);
    this.bus = lp;
    return this.ctx;
  }

  start(track: Track, fromSec: number) {
    this.stop();
    const ctx = this.ensure();
    void ctx.resume();
    this.out = ctx.createGain();
    this.out.gain.value = 0.18;
    this.out.connect(this.bus!);
    this.pat = pattern(track);
    this.stepLen = 60 / track.bpm / 2; // eighth notes
    this.nextStep = Math.ceil(fromSec / this.stepLen);
    this.startAt = ctx.currentTime - fromSec;
    this.timer = window.setInterval(() => this.schedule(), 40);
    this.schedule();
  }

  stop() {
    if (this.timer !== null) window.clearInterval(this.timer);
    this.timer = null;
    if (this.out && this.ctx) {
      // quick fade so stopping never clicks, then drop notes already queued
      const old = this.out;
      const now = this.ctx.currentTime;
      old.gain.cancelScheduledValues(now);
      old.gain.setValueAtTime(old.gain.value, now);
      old.gain.linearRampToValueAtTime(0, now + 0.05);
      window.setTimeout(() => old.disconnect(), 120);
      this.out = null;
    }
  }

  private schedule() {
    const ctx = this.ctx!;
    const p = this.pat!;
    while (this.startAt + this.nextStep * this.stepLen < ctx.currentTime + 0.2) {
      const t = this.startAt + this.nextStep * this.stepLen;
      if (t >= ctx.currentTime - 0.01) {
        const s = this.nextStep;
        const m = p.melody[s % p.melody.length];
        if (m >= 0) this.note(freq(p.root + 12 + m), t, this.stepLen * 1.6, "triangle", 0.5);
        if (s % 8 === 0) this.note(freq(p.root - 12 + p.bass[(s / 8) % 4]), t, this.stepLen * 7, "sine", 0.9);
        if (s % 4 === 2) this.note(freq(p.root + p.bass[Math.floor(s / 8) % 4] + 7), t, this.stepLen * 2, "sine", 0.25);
      }
      this.nextStep++;
    }
  }

  private note(f: number, t: number, len: number, type: OscillatorType, vol: number) {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.value = f;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.015);
    g.gain.exponentialRampToValueAtTime(0.001, t + len);
    o.connect(g).connect(this.out!);
    o.start(t);
    o.stop(t + len + 0.05);
  }
}
